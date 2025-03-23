import Contest from "../models/contest.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";

const createContest = AsyncHandler(async (req, res) => {
  const { name, platform, url, start_time, duration, pcdLink } = req.body;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }


  const user = await User.findOne({ userId });
  if (!user || user.role !== "admin") {
    return res.status(403).json(new ApiResponse(403, {}, "Admin access required", false));
  }

  if (!name || !platform || !url || !start_time || !duration) {
    return res.status(409).json(new ApiResponse(409, {}, "Required fields are missing", false));
  }


 

  const contest = await Contest.findOneAndUpdate({name},
    { $set: {
        name,
        platform,
        url,
        start_time,
        duration,
        pcdLink
      }},
    { upsert: true, new: true },
    );

  return res.status(201).json(new ApiResponse(201, contest, "Contest created successfully", true));
});


const updateContest = AsyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { name, platform, url, start_time, duration, pcdLink } = req.body;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }


  const user = await User.findOne({ userId });
  if (!user || user.role !== "admin") {
    return res.status(403).json(new ApiResponse(403, {}, "Admin access required", false));
  }

  if (!contestId) {
    return res.status(400).json(new ApiResponse(400, {}, "Contest ID is required", false));
  }

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json(new ApiResponse(404, {}, "Contest not found", false));
  }

 
  const updateData = {};
  if (name) updateData.name = name;
  if (platform) updateData.platform = platform;
  if (url) updateData.url = url;
  if (start_time) updateData.start_time = start_time;
  if (duration) updateData.duration = duration;
  if (pcdLink !== undefined) updateData.pcdLink = pcdLink;


  if (name && name !== contest.name) {
    const existingContest = await Contest.findOne({ name });
    if (existingContest) {
      return res.status(409).json(new ApiResponse(409, {}, "Contest with this name already exists", false));
    }
  }

  const updatedContest = await Contest.findByIdAndUpdate(
    contestId,
    updateData,
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedContest, "Contest updated successfully", true));
});

const deleteContest = AsyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }


  const user = await User.findOne({ userId });
  if (!user || user.role !== "admin") {
    return res.status(403).json(new ApiResponse(403, {}, "Admin access required", false));
  }

  if (!contestId) {
    return res.status(400).json(new ApiResponse(400, {}, "Contest ID is required", false));
  }

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json(new ApiResponse(404, {}, "Contest not found", false));
  }

  await Contest.findByIdAndDelete(contestId);

  return res.status(200).json(new ApiResponse(200, {}, "Contest deleted successfully", true));
});

const addPcdLink = AsyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { pcdLink } = req.body;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }


  const user = await User.findOne({ userId });
  if (!user || user.role !== "admin") {
    return res.status(403).json(new ApiResponse(403, {}, "Admin access required", false));
  }

  if (!contestId) {
    return res.status(400).json(new ApiResponse(400, {}, "Contest ID is required", false));
  }

  if (!pcdLink) {
    return res.status(409).json(new ApiResponse(409, {}, "PCD link is required", false));
  }

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json(new ApiResponse(404, {}, "Contest not found", false));
  }

  const updatedContest = await Contest.findByIdAndUpdate(
    contestId,
    { pcdLink },
    { new: true }
  );

  return res.status(200).json(new ApiResponse(200, updatedContest, "PCD link added successfully", true));
});

const getContest = AsyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!contestId) {
    return res.status(400).json(new ApiResponse(400, {}, "Contest ID is required", false));
  }

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json(new ApiResponse(404, {}, "Contest not found", false));
  }

  return res.status(200).json(new ApiResponse(200, contest, "Contest retrieved successfully", true));
});

const getAllContests = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 100, platform, startAfter, startBefore } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  const filter = {};
  
  if (platform) {
    filter.platform = platform;
  }
  
  if (startAfter) {
    filter.start_time = { ...filter.start_time, $gte: new Date(startAfter) };
  }
  
  if (startBefore) {
    filter.start_time = { ...filter.start_time, $lte: new Date(startBefore) };
  }

  const skip = (pageNumber - 1) * limitNumber;

  const totalContests = await Contest.countDocuments(filter);
  
  const contests = await Contest.find(filter)
    .sort({ start_time: 1 })
    .skip(skip)
    .limit(limitNumber);

  const pagination = {
    total: totalContests,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(totalContests / limitNumber)
  };

  return res.status(200).json(
    new ApiResponse(
      200, 
      { contests, pagination }, 
      "Contests retrieved successfully", 
      true
    )
  );
});

export {
  createContest,
  updateContest,
  deleteContest,
  addPcdLink,
  getContest,
  getAllContests
};