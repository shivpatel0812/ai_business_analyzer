#ATTENTION
#THIS FILE HAS NO USE
#This is the associated serverless lambda function 
#If you would like to run this code on your own please follow the step below
#1.) Create a s3 bucket, API gatway, and Lambda function 
#2.) Use this code for Lambda function and configure all 3 through 
#
import json
import openai
import os
import base64
import boto3
import requests
from bs4 import BeautifulSoup
from time import sleep
import re

s3_client = boto3.client('s3')
news_api_key = 'KEY'

def lambda_handler(event, context):
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
    }

    try:
        print("Event: ", event)

        if 'body' not in event or not event['body']:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'No body in the request'})
            }

        try:
            body = json.loads(event['body'])
            print("Parsed Body: ", body)
        except json.JSONDecodeError as e:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'JSON decode error', 'message': str(e)})
            }

        if 'image_data' in body:
            image_data = base64.b64decode(body['image_data'])
        elif 'bucket_name' in body and 'image_key' in body:
            bucket_name = body['bucket_name']
            image_key = body['image_key']
            try:
                s3_response = s3_client.get_object(Bucket=bucket_name, Key=image_key)
                image_data = s3_response['Body'].read()
            except Exception as e:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Error fetching image from S3', 'message': str(e)})
                }
        else:
            return {
                'statusCode': 400,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Missing image_data or S3 info in the request'})
            }

        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'OpenAI API key not set in environment variables'})
            }
        openai.api_key = api_key

        retry_count = 3
        for attempt in range(retry_count):
            try:
                response = openai.ChatCompletion.create(
                    model='gpt-4-vision-preview',
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Return JSON document with data. Only return JSON not other text. Also write out 3 good paragraphs under the JSON that gives details about the company and about the person if possible. Beforea each paragraph write a 1-4 word title that describes what that paragraph is about so when the output comes it comes as that title thenn the summary that goes with that title then the next title then the next summary etc. Also after you write the paragraph rewrite all the contact info and honestly all the important general info reput it under the summary that I told you. Make sure to include the name, role, company address, phone, email and linkein if any of these were scanned and found from the card and applicable.Specifically go into the role of tashe person if mentioned and try to get as specific as possible in what that role does at that specific company. In short the user should be able to scan a business card and all important information should be given so that next time that person maybe speaks to that person or reaches out they are able to have a very background of what they do and mentioning as many key facts regarding the position, projects, experiences, etc. would be the best so that this information can be used for the user."},
                                {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64.b64encode(image_data).decode('utf-8')}"}
                            ]
                        }
                    ],
                    max_tokens=500,

                )
                print("OpenAI API Response: ", response)
                break
            except openai.error.OpenAIError as e:
                print(f"Attempt {attempt + 1} failed with error: {str(e)}")
                if attempt < retry_count - 1:
                    sleep(2 ** attempt)  
                else:
                    return {
                        'statusCode': 500,
                        'headers': cors_headers,
                        'body': json.dumps({'error': 'OpenAI API request error', 'message': str(e)})
                    }

        try:
            response_content = response.choices[0].message['content']
            print("Response Content: ", response_content)
        except (IndexError, KeyError) as e:
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Invalid response format from OpenAI', 'message': str(e)})
            }


        contact_info = extract_contact_info(response_content)

        summary = extract_summary_without_contact(response_content)

        news_articles = fetch_news_about_company(contact_info.get('Company'))
        if not news_articles:
            log_no_news_found(contact_info.get('Company'))

        interview_questions = fetch_interview_questions(contact_info.get('Company'))
        if interview_questions is None:
            interview_questions = []

        structured_response = {
            'contact': contact_info,
            'company': contact_info.get('Company', "No company name provided"),
            'summary': summary,  
            'news': format_news_as_links(news_articles),
            'interview_questions': interview_questions
        }

        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps(structured_response)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': 'An error occurred', 'message': str(e)})
        }

def extract_contact_info(response_content):
    contact_info = {}
    cleaned_content = response_content.split("\n") 

    for line in cleaned_content:
        line_lower = line.lower().strip()  

        if "name:" in line_lower:
            contact_info["Name"] = line.split(":")[1].strip()

        elif "role:" in line_lower or "title:" in line_lower:
            contact_info["Role"] = line.split(":")[1].strip()

        elif "company:" in line_lower:
            contact_info["Company"] = line.split(":")[1].strip()

        elif "phone:" in line_lower:
            contact_info["Phone"] = line.split(":")[1].strip()

        elif "linkedin:" in line_lower:
            contact_info["LinkedIn"] = line.split(":")[1].strip()

        elif "address:" in line_lower:
            contact_info["Address"] = line.split(":")[1].strip()

        elif "email:" in line_lower:
            contact_info["Email"] = line.split(":")[1].strip()


    if 'LinkedIn' not in contact_info:
        for line in cleaned_content:
            if "linkedin.com" in line.lower():
                contact_info['LinkedIn'] = line.strip()
                break
    
    return contact_info

def extract_summary_without_contact(response_content):
    summary_parts = response_content.split("\n\n")
    return "\n\n".join(summary_parts[1:])  

def fetch_news_about_company(company_name):
    if not company_name:
        return None
    url = f"https://newsapi.org/v2/everything?q={company_name}&apiKey={news_api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        articles = response.json().get('articles', [])
        return articles
    return None

def fetch_interview_questions(company_name):
    if not company_name:
        return None
    search_url = f"https://www.indeed.com/cmp/{company_name}/interviews"
    response = requests.get(search_url)
    if response.status_code != 200:
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    interview_questions = []
    for item in soup.find_all('div', {'class': 'css-1dbjc4n r-18u37iz r-1wtj0ep r-u8s1d r-5f2r5o'}):
        question = item.get_text().strip()
        if question:
            interview_questions.append(question)
    
    return interview_questions if interview_questions else []

def log_no_news_found(company_name):
    print(f"No news found for company: {company_name}")

def format_news_as_links(news_articles):
    if not news_articles:
        return []
    formatted_articles = []
    for article in news_articles:
        if 'url' in article and 'title' in article:
            formatted_articles.append({'title': article['title'], 'url': article['url']})
    return formatted_articles