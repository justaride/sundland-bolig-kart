import requests
import json
import time

url = "https://app.offentligdata.com/mcp/"
DEV_JSON = "src/data/developers.json"

def run_enrichment():
    r = requests.get(url, headers={"Accept": "text/event-stream"}, stream=True)
    session_id = r.headers.get("Mcp-Session-Id")
    print(f"Session: {session_id}")
    
    def send(method, params, is_notification=False):
        payload = {
            "jsonrpc": "2.0",
            "method": method,
            "params": params
        }
        if not is_notification:
            payload["id"] = int(time.time() * 1000)
            
        res = requests.post(f"{url}?sessionId={session_id}", json=payload, headers={
            "Content-Type": "application/json", 
            "Accept": "application/json, text/event-stream",
            "Mcp-Session-Id": session_id
        })
        
        text = res.text.strip()
        if "data: " in text:
            text = text.split("data: ")[-1]
        try:
            data = json.loads(text)
            if "result" in data:
                return data["result"]
            return None
        except:
            return None

    # Initialize
    print("Initializing...")
    send("initialize", {
        "protocolVersion": "2024-11-05",
        "capabilities": {},
        "clientInfo": {"name": "enrich-script", "version": "1.0.0"}
    })
    send("notifications/initialized", {}, is_notification=True)
    time.sleep(1)
    
    with open(DEV_JSON, "r") as f:
        developers = json.load(f)
        
    for dev in developers:
        org_nr = dev["orgNumber"]
        print(f"Enriching {dev['name']} ({org_nr})...")
        
        # 1. Details
        res = send("tools/call", {"name": "selskapsdetaljer", "arguments": {"org_nr": org_nr}})
        if res and "content" in res:
            try:
                content = json.loads(res["content"][0]["text"])
                dev["address"] = content.get("forretningsadresse", {}).get("adresse", dev["address"])
                dev["industry"] = content.get("naeringskode1", {}).get("beskrivelse", dev["industry"])
                dev["employees"] = content.get("antallAnsatte", dev["employees"])
            except: pass
            
        # 2. Roles
        res = send("tools/call", {"name": "roller_i_enhet", "arguments": {"org_number": org_nr}})
        if res and "content" in res:
            try:
                content = json.loads(res["content"][0]["text"])
                if isinstance(content, list):
                    dev["roles"] = [{"name": r.get("navn"), "role": r.get("rolle")} for r in content]
            except: pass
            
        # 3. Shareholders
        res = send("tools/call", {"name": "aksjeeiere_for_selskap", "arguments": {"org_nr": org_nr}})
        if res and "content" in res:
            try:
                content = json.loads(res["content"][0]["text"])
                if isinstance(content, list):
                    dev["shareholders"] = [
                        {"name": s.get("navn"), "percentage": s.get("andel"), "type": s.get("type")}
                        for s in content[:10]
                    ]
            except: pass
            
        # 4. Financials
        res = send("tools/call", {"name": "get_company_last_financial_statement", "arguments": {"org_number": org_nr}})
        if res and "content" in res:
            try:
                content = json.loads(res["content"][0]["text"])
                dev["financials"] = content
            except: pass
            
        time.sleep(1)

    with open(DEV_JSON, "w") as f:
        json.dump(developers, f, indent=2, ensure_ascii=False)
    print("Enrichment complete!")

if __name__ == "__main__":
    run_enrichment()