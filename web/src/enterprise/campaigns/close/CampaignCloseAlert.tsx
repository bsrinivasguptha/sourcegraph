import React from 'react'

export interface CampaignCloseAlertProps {
    // nothing.
}

export const CampaignCloseAlert: React.FunctionComponent<CampaignCloseAlertProps> = () => (
    <div className="card shadow mb-3">
        <div className="card-body p-3">
            <p>
                <strong>
                    By closing this campaign, it will be read-only and no new campaign specs can be applied.
                </strong>
            </p>
            <p>By default, all changesets remain untouched.</p>
            <p>
                <input type="checkbox" /> Also close open changesets on code hosts.
            </p>
            <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-secondary mr-3">
                    Cancel
                </button>
                <button type="button" className="btn btn-danger">
                    Close campaign
                </button>
            </div>
        </div>
    </div>
)
