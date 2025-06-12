class ApiFeatutes {
  constructor(dbQuery, reqQuery) {
    this.query = dbQuery;
    this.queryObj = reqQuery;
    this.unpaginatedQuery = dbQuery;
  }

  filter() {
    const filterQuery = { ...this.queryObj };
    const excludedFileds = ["page", "sort", "select", "limit"];
    Object.keys(filterQuery).forEach((el) => {
      if (excludedFileds.includes(el)) delete filterQuery[el];
    });

    // FOR CATEGORY
    if (filterQuery.category) {
      const categories = filterQuery.category.split(",");
      filterQuery.category = { $in: [filterQuery.category] };
    }

    // 1.ADVANCE FILTERING
    const queryStr = JSON.stringify(filterQuery).replace(
      /\b(lt|lte|gt|gte)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    this.unpaginatedQuery = this.query.find(JSON.parse(queryStr));

    return this;
  }
  sorting() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort("basePrice");

    return this;
  }
  limitingFields() {
    if (this.queryObj.select) {
      const limitFileds = this.queryObj.select.split(",").join(" ");
      this.query = this.query.select(limitFileds);
    } else this.query = this.query.select("-__v");

    return this;
  }
  paginating() {
    const page = +this.queryObj.page || 1;
    const limit = +this.queryObj.limit || 10;
    const skip = (page - 1) * limit;

    // Save the unpaginated query
    // this.unpaginatedQuery = this.query;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
export default ApiFeatutes;
