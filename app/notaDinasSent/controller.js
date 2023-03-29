const NotaDinasSent = require("../../app/notaDinasSent/model");

module.exports = {
  insertSent: async (req, res) => {
    try {
      const {
        dari,
        penerima,
        notaDinasKode,
        sentKode,
        disposisi,
        tindakLanjut,
      } = req.body;

      const insertDisposisi = await NotaDinasSent({
        dari,
        penerima,
        notaDinasKode,
        sentKode,
        disposisi,
        tindakLanjut,
      });
      await insertDisposisi.save();
    } catch (err) {
      console.log(err);
    }
  },
};
