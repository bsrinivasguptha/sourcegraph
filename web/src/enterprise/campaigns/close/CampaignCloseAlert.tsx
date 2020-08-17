import React, { useCallback, useState } from 'react'
import * as H from 'history'
import { closeCampaign as _closeCampaign } from './backend'
import { LoadingSpinner } from '@sourcegraph/react-loading-spinner'
import { isErrorLike, asError } from '../../../../../shared/src/util/errors'
import { ErrorAlert } from '../../../components/alerts'
import { Scalars } from '../../../graphql-operations'

export interface CampaignCloseAlertProps {
    campaignID: Scalars['ID']
    closeChangesets: boolean
    setCloseChangesets: (newValue: boolean) => void
    history: H.History
    location: H.Location
    /** For testing only. */
    closeCampaign?: typeof _closeCampaign
}

export const CampaignCloseAlert: React.FunctionComponent<CampaignCloseAlertProps> = ({
    campaignID,
    closeChangesets,
    setCloseChangesets,
    history,
    location,
    closeCampaign = _closeCampaign,
}) => {
    const onChangeCloseChangesets = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
        event => {
            setCloseChangesets(event.target.checked)
        },
        [setCloseChangesets]
    )
    const onCancel = useCallback<React.MouseEventHandler>(() => {
        history.push(location.pathname.replace('/close', ''))
    }, [history, location])
    const [isClosing, setIsClosing] = useState<boolean | Error>(false)
    const onClose = useCallback<React.MouseEventHandler>(async () => {
        setIsClosing(true)
        try {
            await closeCampaign({ campaign: campaignID, closeChangesets })
            history.push(location.pathname.replace('/close', ''))
        } catch (error) {
            setIsClosing(asError(error))
        }
    }, [history, location, closeChangesets, closeCampaign, campaignID])
    return (
        <>
            <div className="card shadow mb-3">
                <div className="card-body p-3">
                    <p>
                        <strong>
                            By closing this campaign, it will be read-only and no new campaign specs can be applied.
                        </strong>
                    </p>
                    <p>By default, all changesets remain untouched.</p>
                    <p>
                        <input type="checkbox" checked={closeChangesets} onChange={onChangeCloseChangesets} /> Also
                        close open changesets on code hosts.
                    </p>
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-secondary mr-3"
                            onClick={onCancel}
                            disabled={isClosing === true}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onClose}
                            disabled={isClosing === true}
                        >
                            {isClosing === true && <LoadingSpinner className="icon-inline" />} Close campaign
                        </button>
                    </div>
                </div>
            </div>
            {isErrorLike(isClosing) && <ErrorAlert error={isClosing} history={history} />}
        </>
    )
}
