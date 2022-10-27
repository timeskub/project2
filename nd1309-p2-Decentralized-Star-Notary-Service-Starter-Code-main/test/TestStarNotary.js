const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!','AWS', tokenId, {from: accounts[0]})
    let starInfo = await instance.tokenIdToStarInfo.call(tokenId);
    assert.equal(starInfo.name, 'Awesome Star!')
    // assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star','AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star','AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star','AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star','AWS', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    // await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:10*10**10});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    // assert.equal(value, starPrice);
    assert.isAbove(value, Number(starPrice));
    // https://knowledge.udacity.com/questions/889262
    /*
    You have speceficed the `gasPrice` as `0` in this test case. Please specify a non-zero value and then try it.
    Note - After making the above changes, the test case will not pass because value and starPrice can never be equal, 
    because there is always a gasprice used to perform the transaction. 
    In order to pass the test case you can compare `value1` with `value2`, once should be higher than the other.
    */
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    // let user2 = accounts[2];
    let starId = 11;
    let starName = 'American Dollar';
    let starSymbol = 'USD';
    await instance.createStar(starName, starSymbol, starId, {from: user1});
    let starInfo = await instance.tokenIdToStarInfo.call(starId);

    assert.equal(starInfo.name, starName);
    assert.equal(starInfo.symbol, starSymbol);

});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 12;
    let starName1 = 'American Dollar';
    let starSymbol1 = 'USD';
    await instance.createStar(starName1, starSymbol1, starId1, {from: user1});

    let starId2 = 13;
    let starName2 = 'Thai Bath';
    let starSymbol2 = 'THB';
    await instance.createStar(starName2, starSymbol2, starId2, {from: user2});
    
    await instance.exchangeStars(starId1, starId2, {from: user1});

    assert.equal(await instance.ownerOf(starId1), user2);
    assert.equal(await instance.ownerOf(starId2), user1);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    // 2. use the transferStar function implemented in the Smart Contract
    // 3. Verify the star owner changed.
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 14;
    let starName1 = 'American Dollar';
    let starSymbol1 = 'USD';
    await instance.createStar(starName1, starSymbol1, starId1, {from: user1});
    
    await instance.transferStar(user2, starId1, {from: user1});

    assert.equal(await instance.ownerOf(starId1), user2);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    // 2. Call your method lookUptokenIdToStarInfo
    // 3. Verify if you Star name is the same
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId1 = 15;
    let starName1 = 'American Dollar';
    let starSymbol1 = 'USD';
    await instance.createStar(starName1, starSymbol1, starId1, {from: user1});
    let result_starName = await instance.lookUptokenIdToStarInfo(starId1);

    assert.equal(result_starName, starName1);
});