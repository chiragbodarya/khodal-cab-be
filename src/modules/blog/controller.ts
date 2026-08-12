import { Request, Response, NextFunction } from 'express';
import AppError  from '../../utils/errors';
import prisma  from '../../config/prisma';
import { sendResponse } from '../../utils/response';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const getBlogs = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { tag } = req.query;
    const filter: any = { published: true };

    if (tag) {
      filter.tags = { has: tag };
    }

    const blogs = await prisma.blog.findMany({
      where: filter,
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendResponse({
      res,
      statusCode: 200,
      data: blogs,
      meta: { count: blogs.length }
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBlogs = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { tag, status } = req.query;
    const filter: any = {};

    if (status) filter.published = status === 'published';
    if (tag) filter.tags = { has: tag };

    const blogs = await prisma.blog.findMany({
      where: filter,
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    sendResponse({
      res,
      statusCode: 200,
      data: blogs,
      meta: { count: blogs.length }
    });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!blog || !blog.published) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const getAdminBlogBySlug = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!blog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    sendResponse({
      res,
      statusCode: 200,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const createBlog = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { title, slug, content, summary, coverImage, tags, published } = req.body;
    const adminId = req.admin.id;

    if (!title || !content) {
      return next(new AppError('Please provide title and content.', 400, 'VALIDATION_ERROR'));
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const existingBlog = await prisma.blog.findUnique({ where: { slug: finalSlug } });
    if (existingBlog) {
      return next(new AppError('A blog post with this title or slug already exists.', 400, 'DUPLICATE_SLUG'));
    }

    const isPublished = published === true || published === 'true';

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        content,
        summary: summary || null,
        coverImage: coverImage || null,
        tags: Array.isArray(tags) ? tags : [],
        published: isPublished,
        publishedAt: isPublished ? new Date() : null,
        adminId
      }
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Blog post created successfully.',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, slug, content, summary, coverImage, tags, published } = req.body;

    const existingBlog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    if (!existingBlog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    const updatedData: any = {};
    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (summary !== undefined) updatedData.summary = summary;
    if (coverImage !== undefined) updatedData.coverImage = coverImage;
    if (tags !== undefined) updatedData.tags = Array.isArray(tags) ? tags : [];

    if (slug !== undefined && slug !== existingBlog.slug) {
      const finalSlug = slugify(slug);
      const slugCheck = await prisma.blog.findUnique({ where: { slug: finalSlug } });
      if (slugCheck) {
        return next(new AppError('A blog post with this slug already exists.', 400, 'DUPLICATE_SLUG'));
      }
      updatedData.slug = finalSlug;
    } else if (title !== undefined && !slug) {
      const finalSlug = slugify(title);
      if (finalSlug !== existingBlog.slug) {
        const slugCheck = await prisma.blog.findUnique({ where: { slug: finalSlug } });
        if (!slugCheck) {
          updatedData.slug = finalSlug;
        }
      }
    }

    if (published !== undefined) {
      const isPublished = published === true || published === 'true';
      updatedData.published = isPublished;
      if (isPublished && !existingBlog.published) {
        updatedData.publishedAt = new Date();
      } else if (!isPublished) {
        updatedData.publishedAt = null;
      }
    }

    const blog = await prisma.blog.update({
      where: { id: parseInt(id) },
      data: updatedData
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Blog post updated successfully.',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const existingBlog = await prisma.blog.findUnique({ where: { id: parseInt(id) } });
    if (!existingBlog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    await prisma.blog.delete({ where: { id: parseInt(id) } });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Blog post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

const controller = {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  getAdminBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
export default controller;
