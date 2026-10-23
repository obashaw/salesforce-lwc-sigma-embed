import { LightningElement, api } from 'lwc';
import getSignedJWT from '@salesforce/apex/SigmaJWTController.getSignedJWT';

export default class GenericEmbed extends LightningElement {
    // Populated automatically by Salesforce on record pages
    @api recordId;

    // Configured in Lightning App Builder
    @api orgSlug;
    @api workbookId;
    @api controlId;
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
                if (this.recordId && this.controlId) {
                    params.push(
                        `${encodeURIComponent(this.controlId)}=${encodeURIComponent(this.recordId)}`
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
