const path = require("path");
const fs = require("fs");
const config = require("../../config");
const axios = require("axios");

const NotaDinas = require("../../app/notadinas/model");
const Callback = require("../../app/callback/model");

module.exports = {
  index: async (req, res) => {
    try {
      const notaDinas = await NotaDinas.find({ flag: 2 });
      // for of untuk async
      // for (const data of notaDinas) {
      //   const id = data.dataResponse.id;
      //   const fileName = data.document;
      //   const signed = await Callback.findOne({ documentId: id });
      //   const outputFilePath = path.resolve(
      //     config.rootPath,
      //     `public/upload/signed/${fileName}`
      //   );

      //   if (fs.existsSync(outputFilePath)) {
      //     console.log("File already exists.");
      //   } else {
      //     try {
      //       const response = await axios({
      //         url: signed.downloadUrl,
      //         method: "GET",
      //         responseType: "stream",
      //       });

      //       response.data.pipe(fs.createWriteStream(outputFilePath));

      //       await new Promise((resolve, reject) => {
      //         response.data.on("end", () => {
      //           console.log("File downloaded successfully.");
      //           resolve();
      //         });

      //         response.data.on("error", (err) => {
      //           console.error("Error downloading file:", err);
      //           reject(err);
      //         });
      //       });
      //     } catch (error) {
      //       console.error("Error downloading file:", error);
      //     }
      //   }
      // }
      res.render("dashboard/index", {
        title: "Dashboard",
        subtitle: "dashboard",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },
};
