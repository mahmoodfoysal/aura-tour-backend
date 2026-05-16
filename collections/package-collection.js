const express = require("express");
const { ObjectId } = require("mongodb");
const verifyJWT = require("../middlewares/jwtTokenVerify");
const router = express.Router();

const packageRoute = (packageCollection) => {
  // get api
  router.get("/api/tourism/get-package-list", async (req, res) => {
    try {
      const getPackageList = packageCollection.find();
      const result = await getPackageList.toArray();
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
    "/api/admin/insert-update-package-dest-list",
    verifyJWT,
    async (req, res) => {
      const {
        _id,
        package_id,
        title,
        duration,
        location,
        image,
        moreImage,
        price,
        originalPrice,
        features,
        discount,
        status,
        is_popular,
        rating,
        badge,
        shortDescription,
        longDescription,
        bestTimeToVisit,
        nearbyAttractions,
        itinerary,
        user_info,
        category,
        tour_date,
      } = req.body;

      const validateItinerary = (items) => {
        return (
          Array.isArray(items) &&
          items.every(
            (item) =>
              typeof item === "object" &&
              item !== null &&
              typeof item.day === "number" &&
              typeof item.title === "string" &&
              Array.isArray(item.activities) &&
              item.activities.every((activity) => typeof activity === "string"),
          )
        );
      };

      const data = {
        package_id: typeof package_id === "number" ? package_id : null,
        title: typeof title === "string" ? title : null,
        location: typeof location === "string" ? location : null,
        duration: typeof duration === "string" ? duration : null,
        category: typeof category === "string" ? category : null,
        status: typeof status === "number" ? status : null,
        is_popular: typeof is_popular === "number" ? is_popular : 0,
        image: typeof image === "string" ? image : null,
        moreImage:
          Array.isArray(moreImage) &&
          moreImage.every((img) => typeof img === "string")
            ? moreImage
            : [],
        price: typeof price === "number" ? price : null,
        originalPrice: typeof originalPrice === "number" ? originalPrice : null,
        rating: typeof rating === "number" ? rating : null,
        badge: typeof badge === "string" ? badge : null,
        features:
          Array.isArray(features) &&
          features.every((item) => typeof item === "string")
            ? features
            : [],
        discount: typeof discount === "string" ? discount : null,
        shortDescription:
          typeof shortDescription === "string" ? shortDescription : null,
        longDescription:
          typeof longDescription === "string" ? longDescription : null,
        bestTimeToVisit:
          typeof bestTimeToVisit === "string" ? bestTimeToVisit : null,
        nearbyAttractions:
          Array.isArray(nearbyAttractions) &&
          nearbyAttractions.every((attr) => typeof attr === "string")
            ? nearbyAttractions
            : [],
        itinerary: validateItinerary(itinerary) ? itinerary : [],
        tour_date: typeof tour_date === "string" ? tour_date : null,
        user_info: typeof user_info === "string" ? user_info : null,
      };

      if (
        data.package_id === null ||
        !data.title ||
        !data.duration ||
        !data.location ||
        !data.image ||
        data.price === null ||
        data.originalPrice === null ||
        data.features.length === 0 ||
        data.status === null ||
        !data.category
      ) {
        return res
          .status(400)
          .send({ error: "Invalid or missing required fields", status: 400 });
      }

      try {
        if (_id) {
          const updateDocId = new ObjectId(_id);
          data.modifiedAt = new Date();
          const result = await packageCollection.updateOne(
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
          const result = await packageCollection.insertOne(data);
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
    "/api/admin/delete-package-list/:id",
    verifyJWT,
    async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await packageCollection.deleteOne(query);
      res.status(200).send({
        status: 200,
        message: "Delete successful",
        deletedCount: result?.deletedCount,
      });
    },
  );

  // update package-dest status

  router.patch(
    "/api/admin/update-package-status/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const { status, user_info } = req.body;
        const updateDoc = {
          $set: { status, user_info, modifiedAt: new Date() },
        };

        const result = await packageCollection.updateOne(filter, updateDoc);

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

  // package details

  router.get("/api/tourism/get-package-list/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const query = {
        _id: new ObjectId(id),
      };

      const result = await packageCollection.findOne(query);

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

  // stock update
  router.patch(
    "/api/tourism/get-package-list/stock/:id",
    verifyJWT,
    async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateStock = req.body;
        const updatedDoc = {
          $set: {
            stock: updateStock.stock,
            modifiedAt: new Date(),
          },
        };
        const result = await packageCollection.updateOne(filter, updatedDoc);
        res.send({
          stock: result?.stock,
          message: "Updated",
        });
      } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).send({ error: "Failed to update" });
      }
    },
  );

  return router;
};

module.exports = packageRoute;
