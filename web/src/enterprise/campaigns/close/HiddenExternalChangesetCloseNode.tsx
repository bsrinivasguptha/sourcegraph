import React from 'react'
import {
    HiddenExternalChangesetInfoCell,
    HiddenExternalChangesetInfoCellProps,
} from '../detail/changesets/HiddenExternalChangesetNode'
import { ChangesetCloseActionKept } from './ChangesetCloseAction'

export interface HiddenExternalChangesetCloseNodeProps {
    node: HiddenExternalChangesetInfoCellProps['node']
}

export const HiddenExternalChangesetCloseNode: React.FunctionComponent<HiddenExternalChangesetCloseNodeProps> = ({
    node,
}) => (
    <>
        <span />
        {/* Hidden changesets are always untouched, so the action will always be "kept". */}
        <ChangesetCloseActionKept />
        <HiddenExternalChangesetInfoCell node={node} />
        <span />
        <span />
        <span />
    </>
)
