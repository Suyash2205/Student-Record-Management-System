#include <iostream>
#include <unordered_map>
#include <list>
#include <string>

using namespace std;

// This is a linked list to store course data.
struct Course {
    string courseName;
    string grade;
    Course* next;
    Course(string cName, string g) : courseName(cName), grade(g), next(nullptr) {}
};

// Binary search tree node to store student data, sorted by GPA
struct Student {
    int id;
    string name;
    float gpa;
    int attendance;  // New field for attendance tracking
    Course* courseHistory; // Linked list of courses
    Student* left;
    Student* right;

    Student(int i, string n, float g, int att = 0)
        : id(i), name(n), gpa(g), attendance(att), courseHistory(nullptr), left(nullptr), right(nullptr) {}
};

// Hash table to store student ID mappings
unordered_map<int, Student*> studentHashTable;

// Function for inserting student data into the Binary Search Tree (BST)
Student* insertStudentBST(Student* root, Student* newStudent) {
    if (!root) return newStudent;
    if (newStudent->gpa < root->gpa) root->left = insertStudentBST(root->left, newStudent);
    else root->right = insertStudentBST(root->right, newStudent);
    return root;
}

// Function for displaying a student's course history
void displayCourseHistory(Course* courseHead) {
    Course* temp = courseHead;
    while (temp) {
        cout << "Course: " << temp->courseName << ", Grade: " << temp->grade << endl;
        temp = temp->next;
    }
}

// Function for displaying a student's data
void displayStudentData(Student* student) {
    if (!student) return;
    cout << "ID: " << student->id << ", Name: " << student->name << ", GPA: " << student->gpa << endl;
    cout << "Attendance: " << student->attendance << " days present" << endl;
    cout << "Course History: " << endl;
    displayCourseHistory(student->courseHistory);
    cout << "-----------------------------" << endl;
}

// In-order traversal to show student data, sorted by GPA
void displayAllStudents(Student* root) {
    if (!root) return;
    displayAllStudents(root->left);
    displayStudentData(root);
    displayAllStudents(root->right);
}

// Function to add a new course to a student's course history
void addCourse(Student* student, string courseName, string grade) {
    Course* newCourse = new Course(courseName, grade);
    newCourse->next = student->courseHistory;
    student->courseHistory = newCourse;
}

// Function to add a new student
Student* addStudent(Student* bstRoot) {
    int id;
    string name;
    float gpa;
    int attendance;

    cout << "Enter Student ID: ";
    cin >> id;
    cout << "Enter Student Name: ";
    cin >> name;
    cout << "Enter GPA: ";
    cin >> gpa;
    cout << "Enter Attendance (days present): ";
    cin >> attendance;

    // Create a new student
    Student* newStudent = new Student(id, name, gpa, attendance);

    // Insert into hash table
    studentHashTable[id] = newStudent;

    // Insert into binary search tree
    bstRoot = insertStudentBST(bstRoot, newStudent);

    // Add courses to the student's history
    int numCourses;
    cout << "Enter number of courses: ";
    cin >> numCourses;
    for (int i = 0; i < numCourses; ++i) {
        string courseName, grade;
        cout << "Enter course name and grade: ";
        cin >> courseName >> grade;
        addCourse(newStudent, courseName, grade);
    }

    return bstRoot;
}

// Function to search for a student by ID
void searchStudentById(int id) {
    if (studentHashTable.find(id) != studentHashTable.end()) {
        displayStudentData(studentHashTable[id]);
    } else {
        cout << "Student with ID " << id << " not found." << endl;
    }
}

// Function to update a student's attendance
void updateAttendance(int id, int daysPresent) {
    if (studentHashTable.find(id) != studentHashTable.end()) {
        studentHashTable[id]->attendance = daysPresent;
        cout << "Updated attendance for ID " << id << " to " << daysPresent << " days present." << endl;
    } else {
        cout << "Student with ID " << id << " not found." << endl;
    }
}

// Function to display a student's attendance
void displayStudentAttendance(int id) {
    if (studentHashTable.find(id) != studentHashTable.end()) {
        cout << "Attendance for " << studentHashTable[id]->name << ": "
             << studentHashTable[id]->attendance << " days present." << endl;
    } else {
        cout << "Student with ID " << id << " not found." << endl;
    }
}

// Main function with menu options
int main() {
    Student* bstRoot = nullptr;
    int choice, id, attendance;

    do {
        cout << "Student Record Management System" << endl;
        cout << "1. Add Student" << endl;
        cout << "2. Display All Students (sorted by GPA)" << endl;
        cout << "3. Search Student by ID" << endl;
        cout << "4. Update Attendance" << endl;
        cout << "5. Display Attendance by Student ID" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                bstRoot = addStudent(bstRoot);
                break;
            case 2:
                displayAllStudents(bstRoot);
                break;
            case 3:
                cout << "Enter Student ID to search: ";
                cin >> id;
                searchStudentById(id);
                break;
            case 4:
                cout << "Enter Student ID to update attendance: ";
                cin >> id;
                cout << "Enter number of days present: ";
                cin >> attendance;
                updateAttendance(id, attendance);
                break;
            case 5:
                cout << "Enter Student ID to display attendance: ";
                cin >> id;
                displayStudentAttendance(id);
                break;
            case 6:
                cout << "Exiting..." << endl;
                break;
            default:
                cout << "Invalid choice. Try again." << endl;
        }
    } while (choice != 6);

    return 0;
}