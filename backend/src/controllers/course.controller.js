const Course = require('../models/Course.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const listCourses = asyncHandler(async (req, res) => {
  const { departmentId, search } = req.query;
  const query = {};
  
  if (departmentId) {
    query.department_id = departmentId;
  }
  if (search) {
    query.$or = [
      { title: new RegExp(search, 'i') },
      { code: new RegExp(search, 'i') }
    ];
  }

  const courses = await Course.find(query).populate('department_id').sort({ code: 1 });

  res.json({
    courses: courses.map((course) => ({
      id: course._id,
      code: course.code,
      name: course.title,
      description: course.description,
      departmentName: course.department_id ? course.department_id.name : null,
    })),
  });
});

const createCourse = asyncHandler(async (req, res) => {
  const { courseCode, courseName, description, departmentId } = req.body;
  
  const existing = await Course.findOne({ code: courseCode });
  if (existing) {
    throw new ApiError(409, 'Course code already exists');
  }

  const course = await Course.create({
    code: courseCode,
    title: courseName,
    description: description || null,
    department_id: departmentId || null
  });

  res.status(201).json({
    course: {
      id: course._id,
      code: course.code,
      name: course.title,
      description: course.description,
      departmentId: course.department_id,
      active: true,
    },
  });
});

const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { courseName, description, departmentId } = req.body;

  const updateData = {};
  if (courseName) updateData.title = courseName;
  if (description) updateData.description = description;
  if (departmentId) updateData.department_id = departmentId;

  const course = await Course.findByIdAndUpdate(id, updateData, { new: true });

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  res.json({ message: 'Course updated', course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByIdAndDelete(id);
  
  if (!course) {
    throw new ApiError(404, 'Course not found');
  }
  res.json({ message: 'Course archived' });
});

module.exports = {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
};
