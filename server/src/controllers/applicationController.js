import prisma from "../lib/prisma.js";

const VALID_STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

/**
 * Create a new job application
 * Only authenticated users can create applications
 * userId is taken from the JWT token, not from request body
 */
export async function createApplication(req, res, next) {
  try {
    const { company, position, status, appliedDate, notes } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!company || company.trim() === "") {
      return res.status(400).json({ message: "Company is required" });
    }

    if (!position || position.trim() === "") {
      return res.status(400).json({ message: "Position is required" });
    }

    if (!appliedDate || appliedDate.trim() === "") {
      return res.status(400).json({ message: "Applied date is required" });
    }

    // Validate status enum
    const finalStatus = status || "APPLIED";
    if (!VALID_STATUSES.includes(finalStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // Validate appliedDate is a valid date
    const dateObj = new Date(appliedDate);
    if (isNaN(dateObj.getTime())) {
      return res.status(400).json({
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Trim string fields
    const cleanCompany = company.trim();
    const cleanPosition = position.trim();
    const cleanNotes = notes ? notes.trim() : null;

    // Create application with Prisma
    const application = await prisma.application.create({
      data: {
        company: cleanCompany,
        position: cleanPosition,
        status: finalStatus,
        appliedDate: dateObj,
        notes: cleanNotes,
        userId,
      },
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        appliedDate: true,
        notes: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all applications of the authenticated user
 * Supports optional filtering by status and search
 */
export async function getApplications(req, res, next) {
  try {
    const userId = req.user.userId;
    const { status, search } = req.query;

    // Validate status query param if provided
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // Build where clause
    const where = {
      userId,
    };

    // Add status filter if provided
    if (status) {
      where.status = status;
    }

    // Add search filter if provided (case-insensitive in company, position, notes)
    if (search) {
      where.OR = [
        { company: { contains: search, mode: "insensitive" } },
        { position: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch applications ordered by createdAt descending
    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        appliedDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      applications,
      count: applications.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single application by id
 * Only returns the application if it belongs to the authenticated user
 * Returns 404 if not found or belongs to another user (do not expose existence)
 */
export async function getApplication(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate and parse id
    const parsedId = Number(id);
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      return res.status(400).json({
        message: "Application ID must be a valid positive number",
      });
    }

    // Find application by id AND userId (security: don't expose existence of other users' apps)
    const application = await prisma.application.findFirst({
      where: {
        id: parsedId,
        userId,
      },
      select: {
        id: true,
        company: true,
        position: true,
        status: true,
        appliedDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return 404 if not found or belongs to another user
    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.status(200).json({
      application,
    });
  } catch (error) {
    next(error);
  }
}
