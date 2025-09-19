const { createOffer } = require("../../controllers/offerController");
const offerRules = require("../../rules/offerRules");

jest.mock("../../rules/offerRules");

describe("Offer Controller", () => {
  let req, res;

  beforeEach(() => {
    req = { body: { name: "Test Offer", value_props: ["Value"], ideal_use_cases: ["B2B SaaS"] } };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  it("should return 400 if an offer already exists", async () => {
    offerRules.canCreateOffer.mockResolvedValue(false);

    await createOffer(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: expect.stringContaining("already exists")
    }));
  });

  it("should create a new offer if none exists", async () => {
    const mockOffer = { name: "Test Offer" };
    offerRules.canCreateOffer.mockResolvedValue(true);
    offerRules.createNewOffer.mockResolvedValue(mockOffer);

    await createOffer(req, res);

    expect(offerRules.createNewOffer).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      data: mockOffer
    }));
  });

  it("should handle errors and return 500", async () => {
    offerRules.canCreateOffer.mockRejectedValue(new Error("DB Error"));

    await createOffer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Internal server error",
      error: "DB Error"
    }));
  });
});
