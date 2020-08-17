import React from 'react'
import { ChangesetLastSynced } from './ChangesetLastSynced'
import { HiddenExternalChangesetFields } from '../../../../graphql-operations'
import { ChangesetStatusCell } from './ChangesetStatusCell'

export interface HiddenExternalChangesetNodeProps {
    node: Pick<
        HiddenExternalChangesetFields,
        'id' | 'nextSyncAt' | 'updatedAt' | 'externalState' | 'publicationState' | 'reconcilerState'
    >
}

export const HiddenExternalChangesetNode: React.FunctionComponent<HiddenExternalChangesetNodeProps> = ({ node }) => (
    <>
        <span />
        <ChangesetStatusCell changeset={node} />
        <HiddenExternalChangesetInfoCell node={node} />
        <span />
        <span />
        <span />
    </>
)

export interface HiddenExternalChangesetInfoCellProps extends HiddenExternalChangesetNodeProps {}

export const HiddenExternalChangesetInfoCell: React.FunctionComponent<HiddenExternalChangesetInfoCellProps> = ({
    node,
}) => (
    <div className="d-flex flex-column">
        <div className="m-0 mb-2">
            <h3 className="m-0 d-inline">
                <span className="text-muted">Changeset in a private repository</span>
            </h3>
        </div>
        <div>
            <ChangesetLastSynced changeset={node} viewerCanAdminister={false} />
        </div>
    </div>
)
