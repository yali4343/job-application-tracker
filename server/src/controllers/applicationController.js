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
