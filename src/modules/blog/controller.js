const AppError = require('../../utils/errors');
const model = require('./model');

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const getBlogs = async (req, res, next) => {
  try {
    const { tag, status } = req.query;
    const filter = {};

    if (!req.admin) {
      filter.published = true;
    } else if (status) {
      filter.published = status === 'published';
    }

    if (tag) {
      filter.tags = { has: tag };
    }

    const blogs = await model.findManyBlogs(filter);

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

const getBlogBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const blog = await model.findBlogBySlug(slug);

    if (!blog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    if (!blog.published && !req.admin) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const createBlog = async (req, res, next) => {
  try {
    const { title, slug, content, summary, coverImage, tags, published } = req.body;
    const adminId = req.admin.id;

    if (!title || !content) {
      return next(new AppError('Please provide title and content.', 400, 'VALIDATION_ERROR'));
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const existingBlog = await model.findBlogBySlug(finalSlug);
    if (existingBlog) {
      return next(new AppError('A blog post with this title or slug already exists.', 400, 'DUPLICATE_SLUG'));
    }

    const isPublished = published === true || published === 'true';

    const blog = await model.createBlog({
      title,
      slug: finalSlug,
      content,
      summary: summary || null,
      coverImage: coverImage || null,
      tags: Array.isArray(tags) ? tags : [],
      published: isPublished,
      publishedAt: isPublished ? new Date() : null,
      adminId
    });

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully.',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, content, summary, coverImage, tags, published } = req.body;

    const existingBlog = await model.findBlogById(parseInt(id));
    if (!existingBlog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    const updatedData = {};
    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (summary !== undefined) updatedData.summary = summary;
    if (coverImage !== undefined) updatedData.coverImage = coverImage;
    if (tags !== undefined) updatedData.tags = Array.isArray(tags) ? tags : [];

    if (slug !== undefined && slug !== existingBlog.slug) {
      const finalSlug = slugify(slug);
      const slugCheck = await model.findBlogBySlug(finalSlug);
      if (slugCheck) {
        return next(new AppError('A blog post with this slug already exists.', 400, 'DUPLICATE_SLUG'));
      }
      updatedData.slug = finalSlug;
    } else if (title !== undefined && !slug) {
      const finalSlug = slugify(title);
      if (finalSlug !== existingBlog.slug) {
        const slugCheck = await model.findBlogBySlug(finalSlug);
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

    const blog = await model.updateBlog(parseInt(id), updatedData);

    res.status(200).json({
      success: true,
      message: 'Blog post updated successfully.',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingBlog = await model.findBlogById(parseInt(id));
    if (!existingBlog) {
      return next(new AppError('Blog post not found.', 404, 'NOT_FOUND'));
    }

    await model.deleteBlog(parseInt(id));

    res.status(200).json({
      success: true,
      message: 'Blog post deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog
};
