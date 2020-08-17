import React from 'react'
import {
    HiddenExternalChangesetInfoCell,
    HiddenExternalChangesetInfoCellProps,
} from '../detail/changesets/HiddenExternalChangesetNode'
import { ChangesetCloseActionClose, ChangesetCloseActionKept } from './ChangesetCloseAction'

export interface HiddenExternalChangesetCloseNodeProps {
    node: HiddenExternalChangesetInfoCellProps['node']
    willClose: boolean
}

export const HiddenExternalChangesetCloseNode: React.FunctionComponent<HiddenExternalChangesetCloseNodeProps> = ({
    node,
    willClose,
}) => (
    <>
        <span />
        {willClose ? <ChangesetCloseActionClose /> : <ChangesetCloseActionKept />}
        <HiddenExternalChangesetInfoCell node={node} />
        <span />
        <span />
        <span />
    </>
)
