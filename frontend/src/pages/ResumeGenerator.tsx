import React, {useState} from "react";
import axios from "axios";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {Document, Page, Text, View, StyleSheet, Font, pdf} from "@react-pdf/renderer";

// Register built-in Times font (fallback)
Font.register({
    family: "Times-Roman",
    fonts: [
        {src: "", fontStyle: "normal", fontWeight: "normal"}, // fallback internal
    ],
});

// PDF styling
const styles = StyleSheet.create({
    page: {
        paddingTop: 28,
        paddingBottom: 28,
        paddingHorizontal: 24,
        fontFamily: "Times-Roman",
    },
    headerName: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    headerContact: {
        fontSize: 11,
        textAlign: "center",
        marginTop: 4,
    },
    line: {
        marginTop: 8,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#000",
        borderBottomStyle: "solid",
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "bold",
        marginTop: 6,
        marginBottom: 4,
        textTransform: "uppercase",
    },
    para: {
        fontSize: 11,
        lineHeight: 1.25,
    },
    bulletRow: {
        flexDirection: "row",
        gap: 4,
        marginBottom: 2,
    },
    bulletDot: {
        fontSize: 11,
        marginRight: 4,
    },
    itemLine: {
        fontSize: 11,
        marginBottom: 2,
    },
    subItemRole: {
        fontSize: 11,
        fontWeight: "bold",
        marginBottom: 2,
    },
    subItemDesc: {
        fontSize: 11,
        lineHeight: 1.25,
        marginBottom: 4,
    },
    skillsRow: {
        flexDirection: "row",
        gap: 16,
    },
    column: {
        flex: 1,
    },
    muted: {
        color: "#333",
    },
});

// Resume JSON structure
type ResumeJSON = {
    summary?: string;
    skills?: string[];
    education?: {degree: string; institution: string; year: string}[];
    experience?: {
        role: string;
        company: string;
        years: string;
        description?: string;
    }[];
    projects?: {name: string; description?: string}[];
    certifications?: string[];
};

// PDF Resume Component
const ResumePDF: React.FC<{
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    data: ResumeJSON;
}> = ({name, email, phone, linkedin, github, data}) => {
    const skills = data.skills || [];
    const mid = Math.ceil(skills.length / 2);
    const col1 = skills.slice(0, mid);
    const col2 = skills.slice(mid);

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                {/* Header */}
                <Text style={styles.headerName}>{name || "Your Name"}</Text>
                <Text style={styles.headerContact}>
                    {email ? email : ""} {email && phone ? " | " : ""} {phone ? phone : ""}
                </Text>
                {(linkedin || github) && (
                    <Text style={styles.headerContact}>
                        {linkedin ? `LinkedIn: ${linkedin}` : ""}
                        {linkedin && github ? " | " : ""}
                        {github ? `GitHub: ${github}` : ""}
                    </Text>
                )}
                <View style={styles.line} />
                {/* Sections */}
                {data.summary && (
                    <>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.para}>{data.summary}</Text>
                    </>
                )}

                {skills.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillsRow}>
                            <View style={styles.column}>
                                {col1.map((s, i) => (
                                    <View key={`s1-${i}`} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.itemLine}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.column}>
                                {col2.map((s, i) => (
                                    <View key={`s2-${i}`} style={styles.bulletRow}>
                                        <Text style={styles.bulletDot}>•</Text>
                                        <Text style={styles.itemLine}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </>
                )}

                {data.education && data.education.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((e, idx) => (
                            <Text key={`edu-${idx}`} style={styles.itemLine}>
                                {e.degree} - {e.institution} ({e.year})
                            </Text>
                        ))}
                    </>
                )}

                {data.experience && data.experience.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experience.map((ex, idx) => (
                            <View key={`exp-${idx}`} wrap={true}>
                                <Text style={styles.subItemRole}>
                                    {ex.role} - {ex.company} ({ex.years})
                                </Text>
                                {ex.description && <Text style={styles.subItemDesc}>{ex.description}</Text>}
                            </View>
                        ))}
                    </>
                )}

                {data.projects && data.projects.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((p, idx) => (
                            <View key={`prj-${idx}`} wrap={true}>
                                <Text style={styles.subItemRole}>{p.name}</Text>
                                {p.description && <Text style={styles.subItemDesc}>{p.description}</Text>}
                            </View>
                        ))}
                    </>
                )}

                {data.certifications && data.certifications.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Certifications</Text>
                        {data.certifications.map((c, idx) => (
                            <View key={`cert-${idx}`} style={styles.bulletRow}>
                                <Text style={styles.bulletDot}>•</Text>
                                <Text style={styles.itemLine}>{c}</Text>
                            </View>
                        ))}
                    </>
                )}
            </Page>
        </Document>
    );
};

// Main Resume Generator
const ResumeGenerator: React.FC = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        linkedin: "",
        github: "",
        skills: "",
        education: "",
        experience: "",
        projects: "",
        certifications: "",
    });

    const [resumeData, setResumeData] = useState<ResumeJSON | null>(null);
    const [loading, setLoading] = useState(false);

    // Handle form inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    // Generate resume JSON from OpenRouter API
    const handleGenerate = async () => {
        if (!process.env.REACT_APP_OPENROUTER_API_KEY) {
            toast.error("Missing OpenRouter API key in .env");
            return;
        }
        if (!formData.name || !formData.email) {
            toast.error("Please enter at least Name and Email");
            return;
        }

        setLoading(true);

        const prompt = `
Generate a concise, professional student resume as valid JSON with exactly these keys:
{
  "summary": "2-3 sentences",
  "skills": ["Skill 1", "Skill 2"],
  "education": [{"degree": "B.Tech ...", "institution": "University ...", "year": "YYYY"}],
  "experience": [{"role": "Job/Intern", "company": "Company", "years": "YYYY–YYYY", "description": "1-3 lines"}],
  "projects": [{"name": "Project", "description": "1-3 lines"}],
  "certifications": ["Certification 1", "Certification 2"]
}
User input:
${JSON.stringify(formData)}
Return only JSON.
`;

        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        {role: "system", content: "You are a precise resume builder."},
                        {role: "user", content: prompt},
                    ],
                    temperature: 0.4,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
                        "HTTP-Referer": window.location.origin,
                        "X-Title": "Resume Generator",
                        "Content-Type": "application/json",
                    },
                }
            );

            // Parse AI response
            const raw = response.data?.choices?.[0]?.message?.content ?? "{}";
            let parsed: ResumeJSON | null = null;
            try {
                parsed = JSON.parse(raw);
            } catch {
                const match = raw.match(/\{[\s\S]*\}/);
                if (match) parsed = JSON.parse(match[0]);
            }

            if (!parsed) {
                toast.error("Could not parse AI output. Try again.");
                setResumeData(null);
            } else {
                setResumeData(parsed);
                toast.success("Resume generated!");
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to generate resume. Check API key/quota.");
        } finally {
            setLoading(false);
        }
    };

    // Convert generated resume into downloadable PDF
    const handleDownloadPDF = async () => {
        if (!resumeData) {
            toast.error("Generate the resume first");
            return;
        }
        const blob = await pdf(
            <ResumePDF
                name={formData.name}
                email={formData.email}
                phone={formData.phone}
                linkedin={formData.linkedin}
                github={formData.github}
                data={resumeData}
            />
        ).toBlob();

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${formData.name || "Resume"}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("PDF downloaded");
    };

    return (
        <div className="min-h-screen bg-gray-900 pt-24 px-4">
            <ToastContainer position="top-right" autoClose={2500} />
            <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-gray-100 rounded-lg shadow-2xl">
                <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-400 tracking-wide">
                    Resume Generator
                </h2>

                <div className="grid gap-5 mb-8">
                    {["name", "email", "phone", "linkedin", "github"].map((field) => (
                        <input
                            key={field}
                            type={field === "email" ? "email" : "text"}
                            name={field}
                            placeholder={field[0].toUpperCase() + field.slice(1)}
                            className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                            onChange={handleChange}
                        />
                    ))}
                    <textarea
                        name="skills"
                        placeholder="Skills (comma separated or free text)"
                        className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                        onChange={handleChange}
                    />
                    <textarea
                        name="education"
                        placeholder="Education details"
                        className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                        onChange={handleChange}
                    />
                    <textarea
                        name="experience"
                        placeholder="Experience / internships"
                        className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                        onChange={handleChange}
                    />
                    <textarea
                        name="projects"
                        placeholder="Projects"
                        className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                        onChange={handleChange}
                    />
                    <textarea
                        name="certifications"
                        placeholder="Certifications"
                        className="bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 text-gray-100 placeholder-gray-400 p-3 rounded-lg transition"
                        onChange={handleChange}
                    />
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-lg shadow-md transition"
                    >
                        {loading ? "Generating..." : "Generate Resume"}
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={!resumeData}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-3 rounded-lg shadow-md transition"
                    >
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumeGenerator;
