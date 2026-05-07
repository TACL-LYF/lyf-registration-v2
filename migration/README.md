Obtain the private key to access this migration from Stephan Loh (for now)
```
export GOOGLE_APPLICATION_CREDENTIALS="/[path-to-the-private-key]/lyf-registration-firebase-admin-private-key.json"
```

Obtain the CSV camp data from Stephan Loh (for now)

Install packages using pip
```
pip install --upgrade firebase-admin
```

Run with
```
python migration.py
```

Options `-v` for verbose logging and `-c` to commit to firebase
