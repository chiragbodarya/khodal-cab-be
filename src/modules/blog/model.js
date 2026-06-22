const prisma = require('../../config/prisma');

const findManyBlogs = async (filter) => {
  return await prisma.blog.findMany({
    where: filter,
    include: {
      admin: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
};

const findBlogBySlug = async (slug) => {
  return await prisma.blog.findUnique({
    where: { slug },
    include: {
      admin: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

const findBlogById = async (id) => {
  return await prisma.blog.findUnique({
    where: { id }
  });
};

const createBlog = async (data) => {
  return await prisma.blog.create({
    data
  });
};

const updateBlog = async (id, data) => {
  return await prisma.blog.update({
    where: { id },
    data
  });
};

const deleteBlog = async (id) => {
  return await prisma.blog.delete({
    where: { id }
  });
};

module.exports = {
  findManyBlogs,
  findBlogBySlug,
  findBlogById,
  createBlog,
  updateBlog,
  deleteBlog
};
