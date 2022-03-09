#!/bin/bash

KEEPER_DIR_NAME=~/.fakekeeper

if [[ ! -e $KEEPER_DIR_NAME ]] ; then
    mkdir $KEEPER_DIR_NAME
fi

echo -e "gimpy@playhouse.com\nJumpySpider4" > $KEEPER_DIR_NAME/bankaccount
echo -e "ladybug\nYellowDonkey" > $KEEPER_DIR_NAME/insurance
echo -e "pokaroo\nMissedHimAgain" > $KEEPER_DIR_NAME/groceries
echo -e "alfred@wayne.com\nBatmanRules100" > $KEEPER_DIR_NAME/retirement
echo -e "marty@mcfly.com\n1.21Gigawatts" > $KEEPER_DIR_NAME/energy
echo -e "j.alfred.prufrock\n04CruellestMonth" > $KEEPER_DIR_NAME/heating