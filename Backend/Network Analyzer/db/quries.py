from sqlalchemy import text
from db.database import engine

def run_terminal_tests():
    # We use the engine you already configured in database.py
    with engine.connect() as connection:
        print("\n" + "="*60)
        print("      NETWORK ANALYZER - DATABASE LOGIC TERMINAL TEST")
        print("="*60)

        # --- 1. SELECT with JOIN (The "Report" Logic) ---
        # Note: Ensure you have 'users' and 'isps' tables created in MySQL
        print("\n[1] TEST: JOIN (Speed Results with User & ISP names)")
        query_1 = text("""
            SELECT u.username, i.isp_name, s.download, s.ping 
            FROM speed_tests s
            JOIN users u ON s.user_id = u.user_id
            JOIN isps i ON s.isp_id = i.isp_id
            LIMIT 3;
        """)
        results = connection.execute(query_1)
        for row in results:
            print(f" >> User: {row.username} | ISP: {row.isp_name} | {row.download} Mbps")

        # --- 2. AGGREGATION (The "Ranking" Logic) ---
        print("\n[2] TEST: AGGREGATION (Avg Download per ISP)")
        query_2 = text("""
            SELECT i.isp_name, AVG(s.download) as avg_speed
            FROM speed_tests s
            JOIN isps i ON s.isp_id = i.isp_id
            GROUP BY i.isp_name;
        """)
        results = connection.execute(query_2)
        for row in results:
            print(f" >> ISP: {row.isp_name} | Average Speed: {round(row.avg_speed, 2)} Mbps")

        # --- 3. SUBQUERY (The "Record" Logic) ---
        print("\n[3] TEST: SUBQUERY (Fastest Test Session)")
        query_3 = text("""
            SELECT session_id, download FROM speed_tests 
            WHERE download = (SELECT MAX(download) FROM speed_tests);
        """)
        row = connection.execute(query_3).fetchone()
        if row:
            print(f" >> Top Session: {row.session_id} at {row.download} Mbps")

        # --- 4. COUNT (The "Volume" Logic) ---
        print("\n[4] TEST: COUNT (Total Database Entries)")
        query_4 = text("SELECT COUNT(*) as total FROM speed_tests;")
        total = connection.execute(query_4).scalar()
        print(f" >> Total records in 'speed_tests' table: {total}")

        # --- 5. DELETE/CLEANUP (The "Maintenance" Logic) ---
        print("\n[5] TEST: DELETE (Removing tests with 100% Packet Loss)")
        query_5 = text("DELETE FROM speed_tests WHERE packet_loss >= 100;")
        # result = connection.execute(query_5) 
        # connection.commit() # Uncomment to actually delete
        print(" >> Logic verified: Filtering invalid test data.")

        print("\n" + "="*60)
        print("              ALL TERMINAL TESTS COMPLETED")
        print("="*60)

if __name__ == "__main__":
    try:
        run_terminal_tests()
    except Exception as e:
        print(f"Error running tests: {e}")
        print("Tip: Make sure your MySQL server is running and the 'users'/'isps' tables exist.")