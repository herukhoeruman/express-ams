const path = require("path");
const fs = require("fs");
const config = require("../../config");
const axios = require("axios");
const FormData = require("form-data");

const NotaDinas = require("../../app/notadinas/model");
const DisposisiMaster = require("../../app/notadinas/modelDisposisi");
const NotaDinasSent = require("../../app/notadinas/modelSent");
const NotaDinasInbox = require("../../app/notadinas/modelInbox");
const Users = require("../../app/users/model");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      const notaDinas = await NotaDinas.find();

      const { startDate, endDate } = req.body;
      const searchData = notaDinas.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );

      res.render("notadinas/index", {
        notaDinas,
        alert,
        title: "Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },

  viewCreate: async (req, res) => {
    try {
      const lastNoAgenda = await NotaDinas.findOne()
        .sort({ noAgenda: -1 })
        .limit(1);
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();

      res.render("notadinas/create", {
        lastNoAgenda,
        disposisiMaster,
        users,
        title: "Buat Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  actionCreate: async (req, res) => {
    try {
      const {
        noAgenda,
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
      } = req.body;

      const notaDinas = await NotaDinas({
        noAgenda,
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
      });
      await notaDinas.save();

      res.status(200).json(notaDinas);
    } catch (err) {
      console.log(err);
    }
  },

  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const notaDinas = await NotaDinas.findOne({ _id: id });

      const lastNoAgenda = await NotaDinas.findOne()
        .sort({ noAgenda: -1 })
        .limit(1);
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();
      const historyDisposisi = await NotaDinasInbox.find({
        notaDinasKode: id,
      });

      res.render("notadinas/edit", {
        notaDinas,
        lastNoAgenda,
        disposisiMaster,
        users,
        historyDisposisi,
        title: "Edit Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
        userUpdate,
      } = req.body;

      if (req.file) {
        const tmp_path = req.file.path;
        const originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        // const filename = req.file.filename + "." + originalExt;
        const filename = id + "_" + req.file.originalname;
        const target_path = path.resolve(
          config.rootPath,
          `public/upload/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on("end", async () => {
          try {
            const updateNotaDinas = await NotaDinas.findOneAndUpdate(
              { _id: id },
              {
                noNotaDinas,
                tahunAgenda,
                tglNotaDinas,
                dari,
                kepada,
                perihal,
                lampiran,
                kodeMasalah,
                sifat,
                keterangan,
                userUpdate,
                files: filename,
              }
            );
            res.status(200).json(updateNotaDinas);
          } catch (err) {
            console.log(err);
          }
        });
      } else {
        const updateNotaDinas = await NotaDinas.findOneAndUpdate(
          { _id: id },
          {
            noNotaDinas,
            tahunAgenda,
            tglNotaDinas,
            dari,
            kepada,
            perihal,
            lampiran,
            kodeMasalah,
            sifat,
            keterangan,
            userUpdate,
          }
        );
        res.status(200).json(updateNotaDinas);
      }
    } catch (err) {
      console.log(err);
    }
  },

  insertNotaDinasSent: async (req, res) => {
    try {
      const { pengirim, notaDinasKode, sentKode, tindakLanjut } = req.body;
      const jsondisposisi = req.body.disposisi;
      const jsonpenerima = req.body.penerima;
      const disposisi = JSON.parse(jsondisposisi);
      const penerima = JSON.parse(jsonpenerima);

      const notaDinasSent = await NotaDinasSent({
        pengirim,
        penerima,
        notaDinasKode,
        sentKode,
        disposisi,
        tindakLanjut,
      });
      await notaDinasSent.save();
      res.status(200).json(notaDinasSent);
    } catch (err) {
      console.log(err);
    }
  },

  insertNotaDinasInbox: async (req, res) => {
    try {
      const username = req.session.user.username;
      const { pengirim, notaDinasKode, sentKode, tindakLanjut, tanggal } =
        req.body;
      const jsondisposisi = req.body.disposisi;
      const jsonpenerima = req.body.penerima;
      const disposisi = JSON.parse(jsondisposisi);
      const penerima = JSON.parse(jsonpenerima);

      const notaDinasInbox = await NotaDinasInbox({
        username: username,
        pengirim: username,
        penerima: penerima,
        notaDinasKode: notaDinasKode,
        sentKode: sentKode,
        disposisi: disposisi,
        tindakLanjut: tindakLanjut,
        tanggal: tanggal,
      });
      await notaDinasInbox.save();
      res.status(200).json(notaDinasInbox);
    } catch (err) {
      console.log(err);
    }
  },

  konsepNotaDinas: async (req, res) => {
    try {
      res.render("notadinas/konsep", {
        title: "Konsep Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },

  savePdf: async (req, res) => {
    try {
      const pdfBase64 = req.body.document;
      const nomor = req.body.nomor;
      const nomorModifikasi = nomor.replace(/\//g, "_");
      const outputPath = path.resolve(
        config.rootPath,
        `public/upload/NOTA_DINAS_${nomorModifikasi}.pdf`
      );

      const dataPdf = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      const buffer = Buffer.from(dataPdf, "base64");

      fs.writeFile(outputPath, buffer, (err) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ status: "error", message: "file failed to save" });
        } else {
          // console.log("File PDF berhasil disimpan:", outputPath);
          res
            .status(200)
            .json({ status: "ok", message: "file saved successfully" });
        }
      });
      // console.log(buffer);
      // return;
    } catch (error) {
      console.log(error);
    }
  },

  setSign: async (req, res) => {
    try {
      const document = path.resolve(
        config.rootPath,
        `public/upload/document.pdf`
      );
      // const signature = `[{"email": "heru@gsp.co.id","detail": [{"p": 1,"x": 119,"y": 63,"w": 63,"h": 31}]}]`;
      const signature = `[{"email":"heru@gmail.com","detail":[{"p":1,"x":129,"y":203,"w":57,"h":27}]}]`;

      let data = new FormData();
      data.append("document", fs.createReadStream(document));
      data.append("signature", signature);

      // console.log(data);
      // return;
      axios
        .post("https://apix.sandbox-111094.com/v2/document/upload", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            apikey: "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl",
            ...data.getHeaders(),
          },
        })
        .then((response) => {
          console.log(response.data);
          res.status(200).json({
            status: "ok",
            message: "document berhasil dikirim",
            data: response.data,
          });
        })
        .catch((error) => {
          console.error(error);
          // Tangani kesalahan yang terjadi
        });
    } catch (err) {
      console.log(err);
    }
  },
};
