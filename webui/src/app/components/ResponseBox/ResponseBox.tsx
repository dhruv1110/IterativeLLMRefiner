import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Enables tables, task lists, and more
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw"; // Allows raw HTML rendering
import rehypeHighlight from "rehype-highlight"; // Enables code syntax highlighting
import "highlight.js/styles/github.min.css"; // Default light mode
import "./ResponseBox.css"

interface ResponseBoxProps {
    response: string;
}

export const ResponseBox: React.FC<ResponseBoxProps> = ({ response }) => {
    const [theme, setTheme] = useState<string>("light");

    const sampleMarkdown = `
# Sample Markdown
## This is a sub-heading
### This is a sub-sub-heading
#### This is a sub-sub-sub-heading
This is a \`paragraph\` with some **bold** text and *italic* text. This is a [link](https://www.example.com).
- This is a list
- Item 2
- Item 3
    1. Item 3.1
    2. Item 3.2
    3. Item 3.3
    
1. This is an ordered list
2. Item 2
3. Item 3

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

~~strikethrough~~

* [ ] task list
* [x] checked item

> This is a blockquote

> This is a blockquote with multiple lines
> Line 2
> Line 3
`;


    useEffect(() => {
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(isDarkMode ? "dark" : "light");
    }, []);

    return (
        <div className={`response-box ${theme === "dark" ? "dark-mode" : "light-mode"}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkRehype]} // Enables tables, lists
                rehypePlugins={[rehypeRaw, rehypeHighlight]} // Enables syntax highlighting
                components={{
                    code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        return match ? (
                            <pre>
                <code className={`hljs ${className || ""}`} {...props}>
                  {children}
                </code>
              </pre>
                        ) : (
                            <code className={`hljs ${className || ""}`} {...props}>
                                {children}
                            </code>
                        );
                    },
                    input({ node, ...props }) {
                        return <input type="checkbox" {...props} disabled />; // Enables task lists
                    },
                }}
            >
                {response}
            </ReactMarkdown>
        </div>
    );
};

export default ResponseBox;
