export interface Department {
  name: string;
}

export interface Faculty {
  id: string;
  name: string;
  departments: string[];
}

export interface University {
  id: string;
  name: string;
  faculties: Faculty[];
}

// Fetch comprehensive Nigerian Universities, Faculties, and Departments dynamically
export const fetchNigerianUniversities = async (): Promise<University[]> => {
  try {
    // Attempt to fetch from a public raw JSON containing comprehensive Nigerian universities
    const response = await fetch('https://raw.githubusercontent.com/ize-302/ng-unis/main/unis.json');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((uni: any) => ({
          id: uni.id || uni.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: uni.name,
          faculties: (uni.faculties || []).map((fac: any) => ({
            id: fac.id || fac.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: fac.name,
            departments: fac.departments || []
          }))
        }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch from remote university API, using local resilient fallback.", error);
  }

  // Fallback resilient database to ensure it NEVER breaks even offline
  return [
    {
      id: "unilag",
      name: "University of Lagos (UNILAG)",
      faculties: [
        {
          id: "eng",
          name: "Engineering",
          departments: ["Civil and Environmental Engineering", "Computer Sciences", "Electrical and Electronics Engineering", "Mechanical Engineering", "Systems Engineering"]
        },
        {
          id: "sci",
          name: "Science",
          departments: ["Computer Sciences", "Mathematics", "Physics", "Chemistry", "Geosciences", "Cell Biology and Genetics"]
        },
        {
          id: "arts",
          name: "Arts",
          departments: ["English", "History and Strategic Studies", "Linguistics", "Philosophy", "Creative Arts"]
        }
      ]
    },
    {
      id: "ui",
      name: "University of Ibadan (UI)",
      faculties: [
        {
          id: "med",
          name: "Clinical Sciences",
          departments: ["Medicine and Surgery", "Nursing", "Physiotherapy", "Dentistry"]
        },
        {
          id: "sci",
          name: "Science",
          departments: ["Computer Science", "Mathematics", "Microbiology", "Zoology", "Botany"]
        },
        {
          id: "tech",
          name: "Technology",
          departments: ["Industrial and Production Engineering", "Agricultural and Environmental Engineering", "Food Technology"]
        }
      ]
    },
    {
      id: "oau",
      name: "Obafemi Awolowo University (OAU)",
      faculties: [
        {
          id: "tech",
          name: "Technology",
          departments: ["Computer Science and Engineering", "Electronic and Electrical Engineering", "Mechanical Engineering", "Chemical Engineering"]
        },
        {
          id: "admin",
          name: "Administration",
          departments: ["Accounting", "Business Administration", "Public Administration", "Local Government Studies"]
        },
        {
          id: "law",
          name: "Law",
          departments: ["Business Law", "International Law", "Jurisprudence and Private Law", "Public Law"]
        }
      ]
    },
    {
      id: "abu",
      name: "Ahmadu Bello University (ABU)",
      faculties: [
        {
          id: "eng",
          name: "Engineering",
          departments: ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering", "Water Resources"]
        },
        {
          id: "env",
          name: "Environmental Design",
          departments: ["Architecture", "Building", "Urban and Regional Planning", "Quantity Surveying", "Industrial Design"]
        }
      ]
    },
    {
      id: "unn",
      name: "University of Nigeria, Nsukka (UNN)",
      faculties: [
        {
          id: "bio",
          name: "Biological Sciences",
          departments: ["Biochemistry", "Microbiology", "Plant Science", "Zoology"]
        },
        {
          id: "soc",
          name: "Social Sciences",
          departments: ["Economics", "Geography", "Political Science", "Psychology", "Sociology"]
        }
      ]
    }
  ];
};
