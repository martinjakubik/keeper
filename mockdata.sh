#!/bin/bash

KEEPER_DIR_NAME=~/.fakekeeper
PASSPHRASE=password

if [[ ! -e $KEEPER_DIR_NAME ]] ; then
    mkdir $KEEPER_DIR_NAME
fi

echo -e "gimpy@playhouse.com\nJumpySpider4" > $KEEPER_DIR_NAME/bankaccount
echo -e "mamasmurf\nAzriel3" > $KEEPER_DIR_NAME/carpets
echo -e "ladybug\nYellowDonkey" > $KEEPER_DIR_NAME/insurance
echo -e "pokaroo\nMissedHimAgain" > $KEEPER_DIR_NAME/groceries
echo -e "alfred@wayne.com\nBatmanRules100" > $KEEPER_DIR_NAME/retirement
echo -e "marty@mcfly.com\n1.21Gigawatts" > $KEEPER_DIR_NAME/energy
echo -e "j.alfred.prufrock\n04CruellestMonth" > $KEEPER_DIR_NAME/heating

echo -e "__long_content__\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\n" > $KEEPER_DIR_NAME/carwash

for counter in {1..50} ; do
    echo -e "userid"$counter\n"password"$counter > $KEEPER_DIR_NAME/zfile$counter
done

gpg -c -a --cipher-algo AES256 $KEEPER_DIR_NAME/carpets