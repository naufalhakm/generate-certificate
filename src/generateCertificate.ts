import puppeteer from 'puppeteer';
import fetch from 'node-fetch';
import * as fs from 'fs';

interface CertificateData {
    success: boolean;
    data: {
        title: string;
        content: string;
        bg: string;
        width: string;
        height: string;
        custom_class: string;
        custom_css: string;
        certificate_student_name: string;
        certificate_code: string;
        quiz_score: string;
        course_completion_date: string;
    };
}

export async function generateCertificate(userID: number, courseID: number, type: string) {
    // Sample API response
    const apiUrl = `https://apicourse2.arkademi.com/api/v2/certificate/gen_certi?course_id=${courseID}&user_id=${userID}`;
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: CertificateData = await response.json() as CertificateData;
    const { data } = apiResponse;
    let htmlContent = data.content;
    data.quiz_score = "100";
    htmlContent = replacePlaceholders(htmlContent, data.certificate_student_name, data.certificate_code, data.quiz_score, data.course_completion_date);

    const html = `
        <html>
        <head>
            <style>
                html {
                    font-family: sans-serif;
                    line-height: 1.15;
                    -webkit-text-size-adjust: 100%;
                    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                }

                body {
                    margin: 0;
                    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, Liberation Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
                    font-size: 1rem;
                    font-weight: 400;
                    line-height: 1.5;
                    color: #212529;
                    text-align: left;
                }
                div {
                    display: block;
                    unicode-bidi: isolate;
                }
                
                p {
                	display: block;
                    margin-top: 0px;
                }
                
                .canvas-generate {
                    width: 100%;
                    position: relative;
                }
                ${data.custom_css}
            </style>
        </head>
        <body>
            <div class="canvas-generate ${data.custom_class}" style="width:${data.width}px; height:${data.height}px; margin:0 auto;">
                ${htmlContent}
            </div>
        </body>
        </html>
    `;

    if (data.title == '') {
        throw new Error(`Course ID ${courseID} and User ID ${userID} is wrong!`);
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(html);
    // await page.setViewport({ width: parseInt(data.width), height: parseInt(data.height) });
    await page.setViewport({ width: parseInt(data.width), height: parseInt(data.height), deviceScaleFactor:2 });
    await page.screenshot({ path: 'certificate.png',fullPage:true,type:'png',omitBackground:false });

    await browser.close();

    console.log('Certificate generated: certificate.png');
}

function replacePlaceholders(content: string, studentName: string, certCode: string, quizScore: string, completionDate: string): string {
    content = content.replace('[certificate_student_name]', studentName);
    content = content.replace('[certificate_code]', certCode);
    content = content.replace('[quiz_score]', quizScore);

    const completionDateStr = new Date(completionDate).toISOString().substring(0, 10);
    content = content.replace('[certificate_student_date]', completionDateStr);
    content = content.replace('[course_completion_date]', completionDateStr);

    return content;
}