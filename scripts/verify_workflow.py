import requests
import json
import time
import sys

BASE_URL = "http://localhost:8080/api"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def print_success(msg):
    print(f"✅ {msg}")

def print_fail(msg):
    print(f"❌ {msg}")
    sys.exit(1)

def register_user(user_data):
    url = f"{BASE_URL}/users/register"
    try:
        resp = requests.post(url, json=user_data)
        if resp.status_code == 200 and resp.json().get("code") == 200:
            print_success(f"Registered user: {user_data['phoneNumber']}")
            return True
        elif resp.status_code == 200 and resp.json().get("code") == 400:
            print(f"⚠️  User {user_data['phoneNumber']} already exists (Code 400). Proceeding.")
            return True
        else:
            print_fail(f"Registration failed. Status: {resp.status_code}, Body: {resp.text}")
            return False
    except Exception as e:
        print_fail(f"Registration exception: {e}")

def login(phone, password):
    url = f"{BASE_URL}/users/login"
    data = {"phoneNumber": phone, "password": password}
    try:
        resp = requests.post(url, json=data)
        if resp.status_code == 200 and resp.json().get("code") == 200:
            user_data = resp.json().get("user")
            print_success(f"Logged in: {phone} (Role: {user_data['role']})")
            return user_data
        else:
            print_fail(f"Login failed for {phone}. Status: {resp.status_code}, Body: {resp.text}")
    except Exception as e:
        print_fail(f"Login exception: {e}")

def create_course(token, teacher_id, course_name):
    url = f"{BASE_URL}/courses"
    headers = {"Authorization": f"Bearer {token}"} # Assuming Bearer, though backend might not check strictly yet
    data = {
        "courseName": course_name, 
        "teacherId": teacher_id,
        "courseDescription": "Integration Test Course",
        "semester": "2026-Spring"
    }
    resp = requests.post(url, json=data, headers=headers)
    if resp.json().get("code") == 200:
        course = resp.json().get("course")
        print_success(f"Created Course: {course['courseName']} (ID: {course['courseId']})")
        return course
    else:
        print_fail(f"Create Course failed: {resp.text}")

def enroll_student(token, student_id, course_id):
    url = f"{BASE_URL}/enrollments/enroll"
    data = {"studentId": student_id, "courseId": course_id}
    # Note: Enrollment technically done by student or admin, usually. Code allows student to enroll or admin.
    resp = requests.post(url, json=data, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        print_success(f"Student {student_id} enrolled in {course_id}")
    elif "Already enrolled" in resp.json().get("message", ""):
        print_success(f"Student {student_id} already enrolled in {course_id}")
    else:
        print_fail(f"Enrollment failed: {resp.text}")

def create_assignment(token, teacher_id, course_id, title):
    url = f"{BASE_URL}/assignments"
    data = {
        "courseId": course_id,
        "teacherId": teacher_id,
        "assignmentTitle": title,
        "assignmentContent": "Calculate 1+1",
        "startTime": "2026-01-01T00:00:00",
        "endTime": "2026-12-31T23:59:59",
        "assignmentStatus": "Published"
    }
    resp = requests.post(url, json=data, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        assignment = resp.json().get("assignment")
        print_success(f"Published Assignment: {assignment['assignmentTitle']} (ID: {assignment['assignmentId']})")
        return assignment
    else:
        print_fail(f"Create Assignment failed: {resp.text}")

def submit_answer(token, student_id, assignment_id):
    url = f"{BASE_URL}/answers/submit"
    data = {
        "assignmentId": assignment_id,
        "studentId": student_id,
        "answerContent": "The answer is 2"
    }
    resp = requests.post(url, json=data, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        answer = resp.json().get("data")
        print_success(f"Submitted Answer: {answer['answerId']}")
        return answer
    else:
        print_fail(f"Submit Answer failed: {resp.text}")

def grade_answer(token, answer_id, score, feedback):
    url = f"{BASE_URL}/answers/grade"
    data = {
        "answerId": answer_id,
        "score": score,
        "feedback": feedback
    }
    resp = requests.post(url, json=data, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        print_success(f"Graded Answer {answer_id} with score {score}")
    else:
        print_fail(f"Grade Answer failed: {resp.text}")

def check_grade(token, student_id, assignment_id):
    url = f"{BASE_URL}/answers/my?assignmentId={assignment_id}&studentId={student_id}"
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        data = resp.json().get("data")
        print_success(f"Student checked grade: Score={data['score']}, Feedback='{data['teacherFeedback']}'")
        return data
    else:
        print_fail(f"Check grade failed: {resp.text}")

def update_profile(token, user_id, new_name):
    url = f"{BASE_URL}/users/update"
    # Need to fetch user first to get other fields or just send ID and what changed if backend supports partial update.
    # Based on code `userService.updateUser(user)`, it uses the entity. Let's try basic fields.
    # We should probably get the user first to fill in data.
    
    get_url = f"{BASE_URL}/users/{user_id}"
    user_resp = requests.get(get_url, headers={"Authorization": f"Bearer {token}"}).json()['data']
    
    user_resp['realName'] = new_name
    
    resp = requests.post(url, json=user_resp, headers={"Authorization": f"Bearer {token}"})
    if resp.json().get("code") == 200:
        print_success(f"Updated profile realName to {new_name}")
    else:
        print_fail(f"Update profile failed: {resp.text}")

def main():
    print("Waiting for server to ensure it is up...")
    time.sleep(5) 

    # Data
    teacher_phone = "13800001001"
    student_phone = "13900002002"
    password = "password123"
    
    # 1. Register & Login Teacher
    print_step("1. Teacher Setup")
    register_user({
        "phoneNumber": teacher_phone,
        "password": password,
        "role": "teacher",
        "username": "TeacherTest",
        "realName": "Mr. Teacher",
        "teacherId": "T001"
    })
    teacher_user = login(teacher_phone, password)
    teacher_token = teacher_user['token']
    
    # 2. Register & Login Student
    print_step("2. Student Setup")
    register_user({
        "phoneNumber": student_phone,
        "password": password,
        "role": "student",
        "username": "StudentTest",
        "realName": "Student A",
        "studentId": "S001"
    })
    student_user = login(student_phone, password)
    student_token = student_user['token']
    
    # 3. Operations
    print_step("3. Course & Enrollment")
    course = create_course(teacher_token, teacher_user['userId'], "Integration 101")
    enroll_student(student_token, student_user['userId'], course['courseId'])
    
    print_step("4. Assignment Lifecycle")
    assignment = create_assignment(teacher_token, teacher_user['userId'], course['courseId'], "Test Assignment 1")
    
    # Student Submit
    answer = submit_answer(student_token, student_user['userId'], assignment['assignmentId'])
    
    # Teacher Grade
    grade_answer(teacher_token, answer['answerId'], 95, "Great job!")
    
    # Student Check
    checked_answer = check_grade(student_token, student_user['userId'], assignment['assignmentId'])
    if checked_answer['score'] != 95:
        print_fail("Score mismatch!")
        
    print_step("5. User Profile Update")
    update_profile(student_token, student_user['userId'], "Student A Updated")
    
    # Re-login to verify
    student_user_new = login(student_phone, password)
    if student_user_new['realName'] == "Student A Updated":
        print_success("Profile update persisted!")
    else:
        print_fail(f"Profile update failed persistence. Got: {student_user_new['realName']}")

    print("\n✅✅✅ INTEGRATION TEST COMPLETED SUCCESSFULLY ✅✅✅")

if __name__ == "__main__":
    main()
