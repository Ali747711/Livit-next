lsof -ti:3005 | xargs kill -9 2>/dev/null; echo "Done"
