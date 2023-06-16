const path = require("path");
const fs = require("fs");
const config = require("../../config");
const axios = require("axios");
const FormData = require("form-data");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const trxId = uuidv4();

const NotaDinas = require("../../app/notadinas/model");
const DisposisiMaster = require("../../app/notadinas/modelDisposisi");
const NotaDinasSent = require("../../app/notadinas/modelSent");
const NotaDinasInbox = require("../../app/notadinas/modelInbox");
const Users = require("../../app/users/model");
const Response = require("../../app/notadinas/modelResponse");
const Request = require("../../app/notadinas/modelRequest");
const Callback = require("../../app/callback/model");
const { trace } = require("console");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      const username = req.session.user.username;
      const notaDinas = await NotaDinas.find({
        kepada: username,
      });
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();

      notaDinas.forEach(async (data) => {
        const id = data.dataResponse.id;
        const fileName = data.document;
        const signed = await Callback.findOne({ documentId: id });
        const outputFilePath = path.resolve(
          config.rootPath,
          `public/upload/signed/${fileName}`
        );

        if (fs.existsSync(outputFilePath)) {
          console.log("File already exists.");
        } else {
          try {
            const response = await axios({
              url: signed.downloadUrl,
              method: "GET",
              responseType: "stream",
            });

            response.data.pipe(fs.createWriteStream(outputFilePath));

            await new Promise((resolve, reject) => {
              response.data.on("end", () => {
                console.log("File downloaded successfully.");
                resolve();
              });

              response.data.on("error", (err) => {
                console.error("Error downloading file:", err);
                reject(err);
              });
            });
          } catch (error) {
            console.error("Error downloading file:", error);
          }
        }
      });
      // // if (notaDinas.length > 0) {
      //   const id = notaDinas[0].dataResponse.id;
      //   const fileName = notaDinas[0].document;
      //   const signed = await Callback.findOne({ documentId: id });
      //   const outputFilePath = path.resolve(
      //     config.rootPath,
      //     `public/upload/signed/${fileName}`
      //   );

      //   if (fs.existsSync(outputFilePath)) {
      //     console.log("File already exists. Skipping download.");
      //   } else {
      //     const response = await axios({
      //       url: signed.downloadUrl,
      //       method: "GET",
      //       responseType: "stream",
      //     });

      //     response.data.pipe(fs.createWriteStream(outputFilePath));

      //     new Promise((resolve, reject) => {
      //       response.data.on("end", () => {
      //         console.log("File downloaded successfully.");
      //         resolve();
      //       });

      //       response.data.on("error", (err) => {
      //         console.error("Error downloading file:", err);
      //         reject(err);
      //       });
      //     });
      //   }
      // // }

      res.render("notadinas/index", {
        notaDinas,
        alert,
        disposisiMaster,
        users,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Masuk",
        username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },

  terkirim: async (req, res) => {
    try {
      const username = req.session.user.username;
      const notaDinasTerkirim = await NotaDinas.find({
        dari: username,
      });
      res.render("notadinas/terkirim/index", {
        notaDinasTerkirim,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Terkirim",
        username,
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
      const divisi = req.session.user.divisi;
      const lastNoAgenda = await NotaDinas.findOne({ divisi: divisi })
        .sort({ noAgenda: -1 })
        .limit(1);
      const users = await Users.find();
      console.log(lastNoAgenda);
      res.render("notadinas/konsep", {
        lastNoAgenda,
        users,
        title: "Konsep Nota Dinas",
        subtitle: "Konsep Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        divisi,
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
    } catch (error) {
      console.log(error);
    }
  },

  setSign: async (req, res) => {
    try {
      const {
        noNotaDinas,
        noAgenda,
        tanggal,
        tahun,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
        fileAttachment,
        flag,
      } = req.body;
      const divisi = req.session.user.divisi;
      const email = req.session.user.email;
      const nomorModifikasi = noNotaDinas.replace(/\//g, "_");
      const document = path.resolve(
        config.rootPath,
        `public/upload/NOTA_DINAS_${nomorModifikasi}.pdf`
      );
      const signature = `[{"email":"${email}","detail":[{"p":1,"x":129,"y":203,"w":57,"h":27}]}]`;
      const ematerai = "";
      const estamp = "";
      const clientId = "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl";

      const filename = document.split("\\").pop();
      const crn = "ams-gsp-nodejs";
      const timestamp = new Date().toLocaleString();
      const key = "RAHASIA";
      const requestBody = {
        document: filename,
        signature: JSON.parse(signature),
        timestamp: timestamp,
      };
      const requestBodyString = JSON.stringify(requestBody);
      const payload = requestBodyString + timestamp;
      const hash = CryptoJS.HmacSHA256(payload, key).toString();

      console.log("hash : " + hash);
      console.log("payload : " + payload);

      const newRequest = new Request({
        trxId: trxId,
        document: filename,
        signature: signature,
        ematerai: ematerai,
        estamp: estamp,
        clientId: clientId,
        crn: crn,
        timestamp: timestamp,
      });
      newRequest.save();

      let data = new FormData();
      data.append("document", fs.createReadStream(document));
      data.append("signature", signature);
      data.append("crn", crn);
      data.append("ceksum", hash);
      data.append("timestamp", timestamp);

      axios
        .post("https://plnsign.id/setposisi/index.php", data, {
          // .post("http://localhost/tekencallback/setposisi/", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            apikey: "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl",
            // apikey: "amj6Oqx234ON0kxFoFGt8wQeIRIapIby",
            ...data.getHeaders(),
          },
        })
        .then((response) => {
          // todo
          const newResponse = new Response({
            trxId: trxId,
            json: JSON.stringify(response.data),
            ttdOleh: req.session.user.username,
            data: response.data.data,
          });
          newResponse.save();

          const notaDinas = new NotaDinas({
            noNotaDinas,
            noAgenda,
            tanggal,
            tahun,
            dari,
            kepada,
            perihal,
            lampiran,
            sifat,
            email,
            divisi,
            document: filename,
            // fileAttachment,
            dataResponse: response.data.data,
            flag,
          });
          notaDinas.save();

          console.log(response.data);
          res.status(200).json(response.data);
        })
        .catch((error) => {
          console.error(error);
          res.status(400).json({ error });
        });
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  },

  detail: async (req, res) => {
    try {
      const { id } = req.params.id;
      const notaDinas = await NotaDinas.findOne({ _id: id });
    } catch (err) {
      console.log(err);
    }
  },
};
