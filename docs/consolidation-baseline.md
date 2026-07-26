# Consolidation Baseline — 2026-07-26

## Hermes Mobile (target)
$(cd /home/ubuntu/hermes-mobile && echo "- pwd: $(pwd)")
$(cd /home/ubuntu/hermes-mobile && echo "- git rev-parse HEAD: $(git rev-parse HEAD 2>/dev/null || echo 'N/A')")
$(cd /home/ubuntu/hermes-mobile && echo "- branch: $(git branch --show-current 2>/dev/null || echo 'N/A')")
$(cd /home/ubuntu/hermes-mobile && echo "- remote: $(git remote -v 2>/dev/null | head -1)")
$(cd /home/ubuntu/hermes-mobile && echo "- status: $(git status --short 2>/dev/null || echo 'N/A')")

## EGA House Platform (source, unchanged)
$(cd /home/ubuntu/ega-house && echo "- pwd: $(pwd)")
$(cd /home/ubuntu/ega-house && echo "- git rev-parse HEAD: $(git rev-parse HEAD 2>/dev/null)")
$(cd /home/ubuntu/ega-house && echo "- branch: $(git branch --show-current 2>/dev/null)")
$(cd /home/ubuntu/ega-house && echo "- remote: $(git remote -v 2>/dev/null | head -1)")
$(cd /home/ubuntu/ega-house && echo "- status: $(git status --short 2>/dev/null)")
