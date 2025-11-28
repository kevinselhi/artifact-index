# Remove Exposed API Keys from Git History

## What Was Exposed

Two You.com API keys were committed in these files:
- `GITHUB_ACTIONS_SETUP.md`
- `YOU_PROXY_SETUP.md`

Keys to remove:
- `ydc-sk-381ec4032cab99a5-gYFXaSSLFQL43U39SeTGPbkKD3MMq1B1-1efabc47`
- `ydc-sk-6328c79732b3d087-dkI9ryBUYn1gqne4FrD6okjESR1i8c0v-3cc2c76f__1SNQG8ETU8N2v5f4HwgDYJZN`

## ⚠️ Important Warnings

1. **This rewrites git history** - all collaborators will need to re-clone
2. **Make a backup first** - you can't undo this easily
3. **Force push required** - this will affect anyone who has cloned the repo
4. **Rotate keys anyway** - even after removal, consider keys compromised

---

## Option 1: BFG Repo-Cleaner (Easiest)

### Step 1: Install BFG

**On macOS:**
```bash
brew install bfg
```

**On Linux:**
```bash
# Download the JAR file
wget https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
alias bfg='java -jar bfg-1.14.0.jar'
```

### Step 2: Create a Fresh Clone

```bash
cd ~
git clone --mirror https://github.com/kevinselhi/artifact-index.git
cd artifact-index.git
```

### Step 3: Create a Secrets File

```bash
cat > secrets.txt << 'EOF'
ydc-sk-381ec4032cab99a5-gYFXaSSLFQL43U39SeTGPbkKD3MMq1B1-1efabc47
ydc-sk-6328c79732b3d087-dkI9ryBUYn1gqne4FrD6okjESR1i8c0v-3cc2c76f__1SNQG8ETU8N2v5f4HwgDYJZN
EOF
```

### Step 4: Run BFG

```bash
bfg --replace-text secrets.txt
```

### Step 5: Clean and Expire

```bash
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### Step 6: Force Push

```bash
git push --force
```

### Step 7: Clean Up

```bash
cd ~/artifact-index  # Your original working directory
git pull --force
rm ~/artifact-index.git/secrets.txt
```

---

## Option 2: git filter-repo (More Control)

### Step 1: Install git-filter-repo

**On macOS:**
```bash
brew install git-filter-repo
```

**On Linux:**
```bash
pip3 install git-filter-repo
```

### Step 2: Create Replacement File

```bash
cd /Users/kevinselhi/artifact-index

cat > replacements.txt << 'EOF'
ydc-sk-381ec4032cab99a5-gYFXaSSLFQL43U39SeTGPbkKD3MMq1B1-1efabc47==>REDACTED_API_KEY_1
ydc-sk-6328c79732b3d087-dkI9ryBUYn1gqne4FrD6okjESR1i8c0v-3cc2c76f__1SNQG8ETU8N2v5f4HwgDYJZN==>REDACTED_API_KEY_2
EOF
```

### Step 3: Make a Backup

```bash
cd ..
cp -r artifact-index artifact-index-backup
cd artifact-index
```

### Step 4: Run Filter

```bash
git filter-repo --replace-text replacements.txt --force
```

### Step 5: Force Push

```bash
git remote add origin https://github.com/kevinselhi/artifact-index.git
git push --force --all
git push --force --tags
```

---

## Option 3: Manual git filter-branch (Most Complex)

Only use if the above options don't work:

```bash
# Create expressions file
cat > filter-expressions.txt << 'EOF'
s/ydc-sk-381ec4032cab99a5-gYFXaSSLFQL43U39SeTGPbkKD3MMq1B1-1efabc47/REDACTED_API_KEY/g
s/ydc-sk-6328c79732b3d087-dkI9ryBUYn1gqne4FrD6okjESR1i8c0v-3cc2c76f__1SNQG8ETU8N2v5f4HwgDYJZN/REDACTED_API_KEY/g
EOF

# Run filter-branch
git filter-branch --tree-filter '
  if [ -f "GITHUB_ACTIONS_SETUP.md" ]; then
    sed -i.bak -f filter-expressions.txt GITHUB_ACTIONS_SETUP.md
    rm -f GITHUB_ACTIONS_SETUP.md.bak
  fi
  if [ -f "YOU_PROXY_SETUP.md" ]; then
    sed -i.bak -f filter-expressions.txt YOU_PROXY_SETUP.md
    rm -f YOU_PROXY_SETUP.md.bak
  fi
' --all

# Clean up
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
```

---

## Verification

After running any method, verify the keys are gone:

```bash
# Search entire history
git log -S "ydc-sk-381ec4032cab99a5" --all
git log -S "ydc-sk-6328c79732b3d087" --all

# Should return nothing
```

---

## Post-Cleanup Steps

1. **Rotate the API keys immediately:**
   - Get new You.com API keys
   - Update local environment variables
   - Update GitHub Secrets

2. **Notify collaborators:**
   - Tell anyone with a clone to delete and re-clone:
     ```bash
     cd ~
     rm -rf artifact-index
     git clone https://github.com/kevinselhi/artifact-index.git
     ```

3. **Verify GitHub:**
   - Check GitHub repository settings
   - Verify no cached versions of old commits exist

---

## Recommended Approach

**For this repo, I recommend Option 1 (BFG):**
- ✅ Fastest and simplest
- ✅ Specifically designed for removing secrets
- ✅ Less likely to corrupt history
- ✅ Well-tested and widely used

**Time estimate:** 5-10 minutes total

---

## Need Help?

If you run into issues:
1. Check the backup you made
2. You can always restore from backup
3. Contact me if you need assistance walking through the steps

**Remember:** Even after cleaning history, treat those keys as compromised and rotate them!
