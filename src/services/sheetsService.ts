import { Participant, parseTimeToSeconds, formatSecondsToTime, SPREADSHEET_ID } from '../constants';

const API_KEY = (import.meta as any).env.VITE_GOOGLE_SHEETS_API_KEY;

export async function fetchAllResults(): Promise<Participant[]> {
  if (!API_KEY) {
    console.warn('Google Sheets API Key is missing. Please add VITE_GOOGLE_SHEETS_API_KEY to your environment.');
    return [];
  }

  try {
    // 1. Get spreadsheet metadata to find all tabs
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${API_KEY}`;
    const metaResponse = await fetch(metaUrl);
    
    if (!metaResponse.ok) {
      const errorData = await metaResponse.json().catch(() => ({}));
      throw new Error(`Failed to fetch spreadsheet metadata: ${metaResponse.status} ${metaResponse.statusText}. ${JSON.stringify(errorData)}`);
    }
    
    const metaData = await metaResponse.json();
    const sheets = metaData.sheets;

    // 2. Fetch data from each sheet
    const sheetResults = await Promise.all(sheets.map(async (sheet: any) => {
      const title = sheet.properties.title;
      try {
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(title)}!A:Z?key=${API_KEY}`;
        const dataResponse = await fetch(dataUrl);
        
        if (!dataResponse.ok) {
          console.error(`Error fetching data for sheet "${title}": ${dataResponse.status} ${dataResponse.statusText}`);
          return [];
        }
        
        const data = await dataResponse.json();
        const rows = data.values;

        if (!rows || rows.length < 1) {
          return [];
        }

        // Find the header row (the first row that contains "name" or "athlete")
        let headerRowIdx = -1;
        for (let i = 0; i < Math.min(rows.length, 10); i++) {
          const row = rows[i];
          const hasName = row.some((cell: any) => {
            const val = String(cell).toLowerCase();
            return val === 'name' || val === 'athlete' || val === 'participant' || val.includes('name');
          });
          if (hasName) {
            headerRowIdx = i;
            break;
          }
        }

        if (headerRowIdx === -1) {
          return [];
        }

        const headers = rows[headerRowIdx].map((h: string) => h.toLowerCase().trim());
      
      const findIndex = (names: string[]) => {
        // 1. Try exact match
        const exact = headers.findIndex((h: string) => names.includes(h));
        if (exact !== -1) return exact;
        
        // 2. Try partial match but exclude common "wrong" prefixes for specific columns
        return headers.findIndex((h: string) => 
          names.some(name => {
            const isMatch = h.includes(name);
            if (name === 'time' || name === 'result') {
              // Avoid matching "start time" or "arrive time" when looking for completion time
              if (h.includes('start') || h.includes('arrive') || h.includes('heat')) return false;
            }
            return isMatch;
          })
        );
      };

      const nameIdx = findIndex(['name', 'athlete', 'participant', 'full name']);
      const levelIdx = findIndex(['level', 'division', 'category', 'class', 'div', 'intermediate/ advanced', 'intermediate', 'advanced']);
      const genderIdx = findIndex(['gender', 'sex', 'male/female', 'm/f']);
      const ageGroupIdx = findIndex(['age group', 'agegroup', 'age', 'ag']);
      const timeIdx = findIndex(['completion time', 'completion time (min)', 'total time', 'duration', 'result', 'time']);
      const raceIdx = findIndex(['race / workout', 'race', 'workout', 'event']);
      const emailIdx = findIndex(['email', 'e-mail']);
      const phoneIdx = findIndex(['phone', 'mobile', 'contact']);

      const normalizeGender = (val: string): 'Male' | 'Female' => {
        const lower = String(val || '').toLowerCase().trim();
        if (lower.startsWith('f')) return 'Female';
        if (lower.startsWith('w')) return 'Female'; // Women
        return 'Male';
      };

      const normalizeLevel = (val: string): 'Intermediate' | 'Advanced' => {
        const lower = String(val || '').toLowerCase().trim();
        if (lower.startsWith('adv')) return 'Advanced';
        return 'Intermediate';
      };

      const participants: Participant[] = [];

      // Start parsing from the row AFTER the header row
      for (let i = headerRowIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || nameIdx === -1 || !row[nameIdx]) continue;

        const rawTime = row[timeIdx] || '';
        const isMinutes = headers[timeIdx]?.includes('(min)');
        let seconds = parseTimeToSeconds(rawTime);
        
        if (isMinutes && !rawTime.includes(':') && seconds !== Infinity) {
          seconds = seconds * 60;
        }

        participants.push({
          name: row[nameIdx] || '',
          level: normalizeLevel(row[levelIdx]),
          gender: normalizeGender(row[genderIdx]),
          ageGroup: row[ageGroupIdx] || '',
          completionTime: rawTime.includes(':') ? rawTime : formatSecondsToTime(seconds),
          race: row[raceIdx] || title,
          email: row[emailIdx] || '',
          phone: row[phoneIdx] || '',
          tabName: title,
          seconds: seconds,
        });
      }
      return participants;
      } catch (err) {
        console.error(`Error fetching data for sheet "${title}":`, err);
        return [];
      }
    }));

    const allParticipants = sheetResults.flat();

    // 3. Calculate rankings per race/tab
    const groupedByRace = allParticipants.reduce((acc, p) => {
      if (!acc[p.tabName]) acc[p.tabName] = [];
      acc[p.tabName].push(p);
      return acc;
    }, {} as Record<string, Participant[]>);

    (Object.values(groupedByRace) as Participant[][]).forEach(raceParticipants => {
      // Overall Rank
      raceParticipants.sort((a, b) => a.seconds - b.seconds);
      raceParticipants.forEach((p, idx) => p.rankOverall = idx + 1);

      // Division Rank
      const divisions = ['Intermediate', 'Advanced'];
      divisions.forEach(div => {
        const divParticipants = raceParticipants.filter(p => p.level === div);
        divParticipants.sort((a, b) => a.seconds - b.seconds);
        divParticipants.forEach((p, idx) => p.rankDivision = idx + 1);
      });

      // Age Group Rank
      const ageGroups = Array.from(new Set(raceParticipants.map(p => p.ageGroup)));
      ageGroups.forEach(ag => {
        const agParticipants = raceParticipants.filter(p => p.ageGroup === ag);
        agParticipants.sort((a, b) => a.seconds - b.seconds);
        agParticipants.forEach((p, idx) => p.rankAgeGroup = idx + 1);
      });
    });

    return allParticipants;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error; // Re-throw to allow App.tsx to handle it
  }
}
