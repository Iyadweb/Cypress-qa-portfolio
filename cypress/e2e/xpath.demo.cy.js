describe ('Cypress Xpath Demo', () => {
it ('shoud verifiy xpath capabilities', () => {
    cy.visit('https://www.letskodeit.com/courses')
    cy.url().should('include', '/courses')
    cy.wait(2000) 
    cy.xpath('//input[@id="search"]').type('test')
    cy.xpath('//div[@id="course-list"]').xpath('./div').should('have.length', 6)

    
})
})
