const NotaDinas = require("../../app/notadinas/model");
const NotaDinasInbox = require("../../app/notadinas/modelInbox");

module.exports = {
  countMiddleware: async (req, res, next) => {
    try {
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      const notaDinas = await NotaDinas.find({
        kepada: jabatan,
        flag: 2,
      });

      const count = await NotaDinasInbox.countDocuments({
        penerima: jabatan,
        readStatus: false,
      });

      console.log(count);

      res.locals.count = count;
      next();
    } catch (err) {
      next(err);
    }
  },
};
