import { LightningElement, api } from 'lwc';
import getSignedJWT from '@salesforce/apex/SigmaJWTController.getSignedJWT';

// Sigma control that receives the Salesforce record ID via the embed URL
// This value should match the Sigma control ID in the workbook(s) you're embedding
// If the workbook does not contain a control with the ID specified below, the filter
// parameter will still be appended to the iframe URL but Sigma won't do anything with it.
const ACCOUNT_CONTROL_ID = 'c-salesforce-account-id';

// Embeds a Sigma workbook on a record page and passes the current record ID
// into the workbook's c-salesforce-account-id control
export default class AccountRecordEmbed extends LightningElement {
    // Populated automatically by Salesforce on record pages
    @api recordId;

    // Configured in Lightning App Builder
    @api orgSlug;
    @api workbookId;
    @api height = 600;
    @api cardTitle = 'Sigma Workbook';

    iframeUrl;
    error;

    get iframeStyle() {
        return `width:100%;height:${this.height}px;border:0;`;
    }

    connectedCallback() {
        if (!this.orgSlug || !this.workbookId) {
            this.error = 'Set the Sigma org slug and workbook ID on this component.';
            return;
        }

        getSignedJWT()
            .then(jwt => {
                const params = [
                    ':embed=true',
                    `:jwt=${jwt}`,
                    `_ts=${Date.now()}`
                ];
                if (this.recordId) {
                    params.push(
                        `${ACCOUNT_CONTROL_ID}=${encodeURIComponent(this.recordId)}`
                    );
                }
                const base = `https://app.sigmacomputing.com/${encodeURIComponent(this.orgSlug)}/workbook/${encodeURIComponent(this.workbookId)}`;
                this.iframeUrl = `${base}?${params.join('&')}`;
            })
            .catch(e => {
                console.error('Failed to fetch JWT:', e);
                this.error = 'Could not load the Sigma workbook.';
            });
    }
}
