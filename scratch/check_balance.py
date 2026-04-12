import re
import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all JSX tags
    # This regex looks for <tag or </tag
    tags = re.findall(r'</?([a-zA-Z0-9_]+)', content)
    
    # We only care about div and HomeownerLayout per our problem context, 
    # but let's check ALL tags for better context if needed
    target_tags = {'div', 'HomeownerLayout'}
    
    # Better approach: parse line by line and track column for loc
    stack = []
    lines = content.split('\n')
    
    # Improved regex: 
    # 1. Opening tag: <tag ... >
    # 2. Self-closing tag: <tag ... />
    # 3. Closing tag: </tag>
    
    # Regex explanation:
    # (?P<close>/</)? : Optional closing slash
    # (?P<tag>div|HomeownerLayout) : Our target tags
    # (?P<params>[^>]*) : Any attributes
    # (?P<self>/)? : Optional self-closing slash
    # (?=>|$) : Followed by > or end of string
    pattern = re.compile(r'<(/?)(div|HomeownerLayout)(\s[^>]*)?(/?)(?=>)')
    
    for i, line in enumerate(lines):
        line_num = i + 1
        for match in pattern.finditer(line):
            is_close = match.group(1) == '/'
            tag_name = match.group(2)
            is_self = match.group(4) == '/'
            
            if is_self:
                # Self-closing tag, skip
                continue
            
            if is_close:
                if not stack:
                    print(f"Extra closing tag </{tag_name}> at line {line_num}")
                else:
                    top_tag = stack.pop()
                    if top_tag[0] != tag_name:
                        print(f"Mismatched closing tag </{tag_name}> at line {line_num} (Expected </{top_tag[0]}> opened at line {top_tag[1]})")
            else:
                stack.append((tag_name, line_num))
                
    if stack:
        print(f"Unclosed tags at end: {stack}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_balance(sys.argv[1])
