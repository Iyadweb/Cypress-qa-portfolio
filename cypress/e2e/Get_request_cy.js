describe('API TESTING' , () => {

    it('should validate get request', () => {
        cy.request (
            {
                method: 'GET',
                url: 'https://gorest.co.in/public/v2/users',
                headers: {
                    'authorization' : 'Bearer 4bda87d871ec124656eeb3ee6dcc5f48822055670aab9bf540b05b6080527efa'
     } }) 
        .then ( (response) => {
            cy.log (JSON.stringify(response))
            expect (response.status).to.eq(200)
            expect (response.body).to.have.length(10)
            expect (response.body[0]).to.have.property("name","Arindam Patil Esq.")
            expect (response.body[0]).to.not.have.property("address")
                    })
    
})
})
