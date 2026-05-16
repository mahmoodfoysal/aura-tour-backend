const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const guideRoute = (guideCollection) => {
  // get api
  router.get("/api/tourism/get-guide-list", async (req, res) => {
    try {
      const getGuidList = guideCollection.find();
      const result = await getGuidList.toArray();
      res.status(200).send({
        list_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({ error: "Data can not fetch" });
    }
  });

  // post api
  router.post(
    "/api/admin/insert-update-guide-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        id,
        name,
        image,
        experience,
        languages,
        specialty,
        rating,
        destination,
        tour_type,
        shortDescription,
        benefits,
        details,
        status,
      } = req.body;

      const validateDetails = (detailsObj) => {
        return (
          typeof detailsObj === "object" &&
          detailsObj !== null &&
          typeof detailsObj.bio === "string" &&
          typeof detailsObj.longDescription === "string" &&
          typeof detailsObj.education === "string" &&
          Array.isArray(detailsObj.certificates) &&
          detailsObj.certificates.every((cert) => typeof cert === "string") &&
          typeof detailsObj.totalTours === "number" &&
          typeof detailsObj.joinedDate === "string"
        );
      };

      const data = {
        id: typeof id === "number" ? id : null,
        name: typeof name === "string" ? name : null,
        image: typeof image === "string" ? image : null,
        experience: typeof experience === "number" ? experience : null,
        languages:
          Array.isArray(languages) &&
          languages.every((lang) => typeof lang === "string")
            ? languages
            : [],
        specialty: typeof specialty === "string" ? specialty : null,
        rating: typeof rating === "number" ? rating : null,
        destination: typeof destination === "string" ? destination : null,
        tour_type: typeof tour_type === "string" ? tour_type : null,
        shortDescription:
          typeof shortDescription === "string" ? shortDescription : null,
        benefits:
          Array.isArray(benefits) &&
          benefits.every((benefit) => typeof benefit === "string")
            ? benefits
            : [],
        details: validateDetails(details) ? details : null,
        status: typeof status === "number" ? status : null,
      };

      if (
        data.id === null ||
        !data.name ||
        !data.image ||
        data.experience === null ||
        data.languages.length === 0 ||
        !data.specialty ||
        data.rating === null ||
        !data.destination ||
        !data.tour_type ||
        !data.shortDescription ||
        data.benefits.length === 0 ||
        !data.details ||
        data.status === null
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields", status: 400 });
      }

      try {
        if (_id) {
          const updateDocId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await guideCollection.updateOne(
            {
              _id: updateDocId,
            },
            {
              $set: data,
            },
          );
          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .send({ error: "No data modified", status: 404 });
          }
          res
            .status(201)
            .send({ message: "Update Successful", id: _id, status: 201 });
        } else {
          data.createdAt = new Date();
          const result = await guideCollection.insertOne(data);
          res.status(200).send({
            message: "Successful",
            id: result.insertedId,
            status: 200,
          });
        }
      } catch (error) {
        res
          .status(500)
          .send({ error: "Failed to create or update", status: 500 });
      }
    },
  );

  // delete api
  router.delete(
    "/api/admin/delete-guide-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await guideCollection.deleteOne(query);
      res.status(200).send({
        status: 200,
        message: "Delete successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  // update guide status

  router.patch(
    "/api/admin/update-guide-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status, user_info } = req.body;
        const updateDoc = {
          $set: { status, user_info, modifiedAt: new Date() },
        };

        const result = await guideCollection.updateOne(filter, updateDoc);

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Not found" });
        }

        res.status(200).send({
          status: 200,
          id: id,
          status_code: status,
          message: status === 1 ? "Active successful" : "Inactive successful",
        });
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ message: "An error occurred while updating the status." });
      }
    },
  );

  // get single galary
  router.get("/api/tourism/get-guide-list/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const query = {
        _id: new ObjectId(id),
      };

      const result = await guideCollection.findOne(query);

      if (!result) {
        return res.status(404).send({
          message: "Not found",
        });
      }

      res.status(200).send({
        details_data: result,
        message: "Successful",
      });
    } catch (error) {
      res.status(500).send({
        error: "Failed to fetch",
      });
    }
  });

  return router;
};

module.exports = guideRoute;
