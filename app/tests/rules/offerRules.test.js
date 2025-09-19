const { canCreateOffer, createNewOffer } = require("../../rules/offerRules");
const Offer = require("../../models/Offer");

jest.mock("../../models/Offer");

describe("Offer Rules", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return false if an offer already exists", async () => {
    Offer.findOne.mockResolvedValue({ name: "Existing Offer" });
    const result = await canCreateOffer();
    expect(result).toBe(false);
  });

  it("should return true if no offer exists", async () => {
    Offer.findOne.mockResolvedValue(null);
    const result = await canCreateOffer();
    expect(result).toBe(true);
  });

  it("should create a new offer", async () => {
    const mockOffer = { save: jest.fn().mockResolvedValue({}), name: "Test Offer" };
    Offer.mockImplementation(() => mockOffer);

    const data = { name: "Test Offer", value_props: "Value", ideal_use_cases: "Use Case" };
    const offer = await createNewOffer(data);

    expect(mockOffer.save).toHaveBeenCalled();
    expect(offer.name).toBe("Test Offer");
  });
});
