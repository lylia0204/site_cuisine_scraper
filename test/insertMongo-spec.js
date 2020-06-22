var expect = require("chai").expect;
const assert = require('assert');

decribe ("Creating documents", () => {
    it ("creates an article", (done) => {
        const article = new article({ pmid : 19909739})
        article.save()
        .then(() => {
            assert(!article.isNew)
            done()
        })
    })
})