#!/bin/sh
npm run build  \
&& docker build \
    --tag=repka \
    --file=./Dockerfile \
    ./dist \
&& docker tag repka alexanderkarpov/repka \
&& docker push alexanderkarpov/repka
