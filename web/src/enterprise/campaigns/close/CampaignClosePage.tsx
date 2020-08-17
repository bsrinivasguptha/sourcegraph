import React, { useCallback, useMemo, useEffect, useState } from 'react'
import * as H from 'history'
import { PageTitle } from '../../../components/PageTitle'
import { CampaignHeader } from '../detail/CampaignHeader'
import { CampaignCloseAlert } from './CampaignCloseAlert'
import { FilteredConnection, FilteredConnectionQueryArgs } from '../../../components/FilteredConnection'
import {
    ChangesetFields,
    Scalars,
    ChangesetExternalState,
    ChangesetPublicationState,
} from '../../../graphql-operations'
import { ChangesetCloseNode, ChangesetCloseNodeProps } from './ChangesetCloseNode'
import { Subject } from 'rxjs'
import {
    queryExternalChangesetWithFileDiffs as _queryExternalChangesetWithFileDiffs,
    queryChangesets as _queryChangesets,
} from '../detail/backend'
import { ThemeProps } from '../../../../../shared/src/theme'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { repeatWhen, withLatestFrom, map, filter, delay } from 'rxjs/operators'
import { createHoverifier, HoveredToken } from '@sourcegraph/codeintellify'
import {
    RepoSpec,
    RevisionSpec,
    FileSpec,
    ResolvedRevisionSpec,
    UIPositionSpec,
    ModeSpec,
} from '../../../../../shared/src/util/url'
import { HoverMerged } from '../../../../../shared/src/api/client/types/hover'
import { ActionItemAction } from '../../../../../shared/src/actions/ActionItem'
import { isDefined, property } from '../../../../../shared/src/util/types'
import { getHover, getDocumentHighlights } from '../../../backend/features'
import { getHoverActions } from '../../../../../shared/src/hover/actions'
import { useObservable } from '../../../../../shared/src/util/useObservable'
import { getModeFromPath } from '../../../../../shared/src/languages'
import { WebHoverOverlay } from '../../../components/shared'
import { TelemetryProps } from '../../../../../shared/src/telemetry/telemetryService'

export interface CampaignCloseHeaderProps {
    nodes: ChangesetFields[]
    totalCount?: number | null
}

export const CampaignCloseHeader: React.FunctionComponent<CampaignCloseHeaderProps> = ({ nodes, totalCount }) => (
    <>
        <div className="changeset-spec-list-header__title mb-2">
            <strong>
                Displaying {nodes.length}
                {totalCount && <> of {totalCount}</>} changesets
            </strong>
        </div>
        <span />
        <h5 className="text-uppercase text-center text-nowrap text-muted">Action</h5>
        <h5 className="text-uppercase text-nowrap text-muted">Changeset information</h5>
        <h5 className="text-uppercase text-center text-nowrap text-muted">Check state</h5>
        <h5 className="text-uppercase text-center text-nowrap text-muted">Review state</h5>
        <h5 className="text-uppercase text-right text-nowrap text-muted">Changes</h5>
    </>
)

export interface CampaignClosePageProps
    extends ThemeProps,
        TelemetryProps,
        PlatformContextProps,
        ExtensionsControllerProps {
    campaignID: Scalars['ID']
    viewerCanAdminister: boolean
    history: H.History
    location: H.Location
    campaignUpdates: Subject<void>
    willClose: boolean

    /** For testing only. */
    queryChangesets?: typeof _queryChangesets
    /** For testing only. */
    queryExternalChangesetWithFileDiffs?: typeof _queryExternalChangesetWithFileDiffs
}

export const CampaignClosePage: React.FunctionComponent<CampaignClosePageProps> = ({
    campaignID,
    campaignUpdates,
    history,
    location,
    viewerCanAdminister,
    extensionsController,
    isLightTheme,
    platformContext,
    telemetryService,
    queryChangesets = _queryChangesets,
    queryExternalChangesetWithFileDiffs,
    willClose,
}) => {
    const queryChangesetsConnection = useCallback(
        (args: FilteredConnectionQueryArgs) =>
            queryChangesets({
                externalState: ChangesetExternalState.OPEN,
                publicationState: ChangesetPublicationState.PUBLISHED,
                checkState: null,
                reviewState: null,
                first: args.first ?? null,
                campaign: campaignID,
                onlyCreatedByThisCampaign: true,
            }).pipe(repeatWhen(notifier => notifier.pipe(delay(5000)))),
        [campaignID, queryChangesets]
    )

    const containerElements = useMemo(() => new Subject<HTMLElement | null>(), [])
    const nextContainerElement = useMemo(() => containerElements.next.bind(containerElements), [containerElements])

    const hoverOverlayElements = useMemo(() => new Subject<HTMLElement | null>(), [])
    const nextOverlayElement = useCallback((element: HTMLElement | null): void => hoverOverlayElements.next(element), [
        hoverOverlayElements,
    ])

    const closeButtonClicks = useMemo(() => new Subject<MouseEvent>(), [])
    const nextCloseButtonClick = useCallback((event: MouseEvent): void => closeButtonClicks.next(event), [
        closeButtonClicks,
    ])

    const componentRerenders = useMemo(() => new Subject<void>(), [])

    const hoverifier = useMemo(
        () =>
            createHoverifier<RepoSpec & RevisionSpec & FileSpec & ResolvedRevisionSpec, HoverMerged, ActionItemAction>({
                closeButtonClicks,
                hoverOverlayElements,
                hoverOverlayRerenders: componentRerenders.pipe(
                    withLatestFrom(hoverOverlayElements, containerElements),
                    map(([, hoverOverlayElement, relativeElement]) => ({
                        hoverOverlayElement,
                        // The root component element is guaranteed to be rendered after a componentDidUpdate
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        relativeElement: relativeElement!,
                    })),
                    // Can't reposition HoverOverlay if it wasn't rendered
                    filter(property('hoverOverlayElement', isDefined))
                ),
                getHover: hoveredToken =>
                    getHover(getLSPTextDocumentPositionParameters(hoveredToken), { extensionsController }),
                getDocumentHighlights: hoveredToken =>
                    getDocumentHighlights(getLSPTextDocumentPositionParameters(hoveredToken), { extensionsController }),
                getActions: context => getHoverActions({ extensionsController, platformContext }, context),
                pinningEnabled: true,
            }),
        [
            closeButtonClicks,
            containerElements,
            extensionsController,
            hoverOverlayElements,
            platformContext,
            componentRerenders,
        ]
    )
    useEffect(() => () => hoverifier.unsubscribe(), [hoverifier])

    const hoverState = useObservable(useMemo(() => hoverifier.hoverStateUpdates, [hoverifier]))
    useEffect(() => {
        componentRerenders.next()
    }, [componentRerenders, hoverState])

    const [closeChangesets, setCloseChangesets] = useState<boolean>(false)

    return (
        <>
            <PageTitle title="Preview close" />
            <CampaignHeader name="awesome-campaign" />
            <CampaignCloseAlert
                campaignID={campaignID}
                closeChangesets={closeChangesets}
                setCloseChangesets={setCloseChangesets}
                history={history}
                location={location}
            />
            <h2>Closing the campaign will close the following changesets:</h2>
            <div className="list-group position-relative" ref={nextContainerElement}>
                <FilteredConnection<ChangesetFields, Omit<ChangesetCloseNodeProps, 'node'>>
                    className="mt-2"
                    nodeComponent={ChangesetCloseNode}
                    nodeComponentProps={{
                        isLightTheme,
                        viewerCanAdminister,
                        history,
                        location,
                        campaignUpdates,
                        extensionInfo: { extensionsController, hoverifier },
                        queryExternalChangesetWithFileDiffs,
                        willClose,
                    }}
                    queryConnection={queryChangesetsConnection}
                    hideSearch={true}
                    defaultFirst={15}
                    noun="changeset"
                    pluralNoun="changesets"
                    history={history}
                    location={location}
                    useURLQuery={true}
                    listComponent="div"
                    listClassName="campaign-changesets__grid mb-3"
                    headComponent={CampaignCloseHeader}
                />
                {hoverState?.hoverOverlayProps && (
                    <WebHoverOverlay
                        {...hoverState.hoverOverlayProps}
                        telemetryService={telemetryService}
                        extensionsController={extensionsController}
                        isLightTheme={isLightTheme}
                        location={location}
                        platformContext={platformContext}
                        hoverRef={nextOverlayElement}
                        onCloseButtonClick={nextCloseButtonClick}
                    />
                )}
            </div>
        </>
    )
}

function getLSPTextDocumentPositionParameters(
    hoveredToken: HoveredToken & RepoSpec & RevisionSpec & FileSpec & ResolvedRevisionSpec
): RepoSpec & RevisionSpec & ResolvedRevisionSpec & FileSpec & UIPositionSpec & ModeSpec {
    return {
        repoName: hoveredToken.repoName,
        revision: hoveredToken.revision,
        filePath: hoveredToken.filePath,
        commitID: hoveredToken.commitID,
        position: hoveredToken,
        mode: getModeFromPath(hoveredToken.filePath || ''),
    }
}
