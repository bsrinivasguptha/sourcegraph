import React, { useState } from 'react'
import * as H from 'history'
import { PageTitle } from '../../../components/PageTitle'
import { CampaignHeader } from '../detail/CampaignHeader'
import { CampaignCloseAlert } from './CampaignCloseAlert'
import { Scalars } from '../../../graphql-operations'
import { Subject } from 'rxjs'
import {
    queryExternalChangesetWithFileDiffs as _queryExternalChangesetWithFileDiffs,
    queryChangesets as _queryChangesets,
} from '../detail/backend'
import { ThemeProps } from '../../../../../shared/src/theme'
import { PlatformContextProps } from '../../../../../shared/src/platform/context'
import { ExtensionsControllerProps } from '../../../../../shared/src/extensions/controller'
import { TelemetryProps } from '../../../../../shared/src/telemetry/telemetryService'
import { closeCampaign as _closeCampaign } from './backend'
import { CampaignCloseChangesetsList } from './CampaignCloseChangesetsList'

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

    /** For testing only. */
    queryChangesets?: typeof _queryChangesets
    /** For testing only. */
    queryExternalChangesetWithFileDiffs?: typeof _queryExternalChangesetWithFileDiffs
    /** For testing only. */
    closeCampaign?: typeof _closeCampaign
    /** For testing only. */
    willCloseOverwrite?: boolean
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
    queryChangesets,
    queryExternalChangesetWithFileDiffs,
    closeCampaign,
    willCloseOverwrite,
}) => {
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
                closeCampaign={closeCampaign}
            />
            <h2>Closing the campaign will close the following changesets:</h2>
            <CampaignCloseChangesetsList
                campaignID={campaignID}
                campaignUpdates={campaignUpdates}
                history={history}
                location={location}
                viewerCanAdminister={viewerCanAdminister}
                extensionsController={extensionsController}
                isLightTheme={isLightTheme}
                platformContext={platformContext}
                telemetryService={telemetryService}
                queryChangesets={queryChangesets}
                queryExternalChangesetWithFileDiffs={queryExternalChangesetWithFileDiffs}
                willClose={typeof willCloseOverwrite === 'boolean' ? willCloseOverwrite : closeChangesets}
            />
        </>
    )
}
