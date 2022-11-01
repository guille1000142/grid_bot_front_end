#!/bin/bash
# -*- ENCODING: UTF-8 -*-
export NODE_OPTIONS="--max-old-space-size=20192"
rm -rf build/
npm run build
exit