'use strict';

module.exports = class ConfirmPayment {
  constructor(data) {
    const transactionConfirmRequest = typeof data.transactionID !== undefined ?
      '<TRX_ID>' + data.transactionID + '</TRX_ID>' :
      '<MERCHANT_TRANSACTION_ID>' + data.merchantTransactionID + '</MERCHANT_TRANSACTION_ID>';

    this.body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tns="tns:ns">
      <soapenv:Header>
        <tns:CheckOutHeader>
          <MERCHANT_ID>${process.env.PAYBILL_NUMBER}</MERCHANT_ID>
          <PASSWORD>${data.encryptedPassword}</PASSWORD>
          <TIMESTAMP>${data.timeStamp}</TIMESTAMP>
        </tns:CheckOutHeader>
      </soapenv:Header>
      <soapenv:Body>
        <tns:transactionConfirmRequest>
          ${transactionConfirmRequest}
        </tns:transactionConfirmRequest>
      </soapenv:Body>
    </soapenv:Envelope>`;
  }

  requestBody() {
    return this.body;
  }
};
