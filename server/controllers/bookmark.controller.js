import Bookmark from "../models/bookmark.model.js";
import User from "../models/user.model.js";
import Contest from "../models/contest.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import AsyncHandler from "../utils/AsyncHandler.js";
import { bookmarkReminderQueue } from "../configs/redis.config.js";

const addBookmark = AsyncHandler(async (req, res) => {
  const { contestId, customRemainder } = req.body;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }

  if (!contestId) {
    return res.status(400).json(new ApiResponse(400, {}, "Contest ID is required", false));
  }


  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found", false));
  }


  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json(new ApiResponse(404, {}, "Contest not found", false));
  }


  const existingBookmark = await Bookmark.findOne({
    user: user._id,
    contest: contestId
  });

  if (existingBookmark) {
    return res.status(409).json(new ApiResponse(409, {}, "Bookmark already exists", false));
  }

  const contestStartTime = new Date(contest.start_time);
  const defaultRemainder = new Date(contestStartTime.getTime() - 15 * 60000); 

  const bookmarkData = {    
    user: user._id,
    contest: contestId,
    remainder: customRemainder ? new Date(customRemainder) : defaultRemainder
  };

  const bookmark = await Bookmark.create(bookmarkData);

  const currentTime = Date.now();
  const delay = bookmarkData.remainder - currentTime;

  const email = user.emailId
  const contestTitle = contest.name  
  const contestUrl = contest.url
  const startTime = contest.start_time

  if(delay>0){
    await bookmarkReminderQueue.add('bookmarkReminderQueue', {
      email,
      contestTitle,
      contestUrl,
      startTime
    }, {
      delay,
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false
    });
  }

  const populatedBookmark = await Bookmark.findById(bookmark._id)
    .populate('contest');

  return res.status(201).json(
    new ApiResponse(201, populatedBookmark, "Bookmark added successfully", true)
  );
});

const removeBookmark = AsyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }

  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found", false));
  }

  const bookmark = await Bookmark.findOneAndDelete({contest:contestId,user:user._id});
  if (!bookmark) {
    return res.status(404).json(new ApiResponse(404, {}, "Bookmark not found", false));
  }


  return res.status(200).json(new ApiResponse(200, {}, "Bookmark removed successfully", true));
});

const getBookmarks = AsyncHandler(async (req, res) => {
  const { page = 1, limit = 1000 } = req.query;
  const userId = req.auth.userId;

  if (!userId) {
    return res.status(401).json(new ApiResponse(401, {}, "Unauthorized Request", false));
  }

  // Find user by clerk userId
  const user = await User.findOne({ userId });
  if (!user) {
    return res.status(404).json(new ApiResponse(404, {}, "User not found", false));
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);

  const skip = (pageNumber - 1) * limitNumber;

  const totalBookmarks = await Bookmark.countDocuments({ user: user._id });

  const bookmarks = await Bookmark.find({ user: user._id })
    .populate('contest')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  const pagination = {
    total: totalBookmarks,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(totalBookmarks / limitNumber)
  };

  return res.status(200).json(
    new ApiResponse(
      200,
      { bookmarks, pagination },
      "Bookmarks retrieved successfully",
      true
    )
  );
});

export {
  addBookmark,
  removeBookmark,
  getBookmarks
};