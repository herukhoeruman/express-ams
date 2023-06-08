const Callback = require("../../app/callback/model");

module.exports = {
  index: async (req, res) => {
    try {
      const data = req.body;
      const status = data.status;
      const code = data.code;

      if (status && code === "DOCUMENT_SIGN_COMPLETE") {
        const newCallback = await Callback({
          // trxId: trxId,
          json: JSON.stringify(data),
          status,
          code,
          documentId: data.data.document_id,
          signerName: data.data.signer_name,
          signerEmail: data.data.signer_email,
          email: data.data.email,
          url: data.data.url,
          documentFileName: data.data.document_file_name,
          documentOwnerName: data.data.document_owner_name,
          documentOwnerEmail: data.data.document_owner_email,
          downloadUrl: data.data.download_url,
        });
        await newCallback.save();
      } else {
        const newCallback = await Callback({
          // trxId: trxId,
          json: JSON.stringify(data),
          status,
          code,
        });
        await newCallback.save();
      }

      res.status(200).json(data);
    } catch (err) {
      console.log(err);
    }
  },
};
