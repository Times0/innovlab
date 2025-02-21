# sudo "$(which python3)" scan.py
import nmap


def scan_network(network_range):
    nm = nmap.PortScanner()
    nm.scan(hosts=network_range, arguments="-sn")  # -sn: Ping scan (no port scan)

    print("\nDiscovered Devices:")
    print("-" * 40)
    ips = []
    for host in nm.all_hosts():
        mac_address = nm[host]["addresses"].get("mac", "Unknown MAC")
        vendor = nm[host]["vendor"].get(mac_address, "Unknown Vendor")

        if vendor == "SZ DJI Technology":
            ips.append(host)

    print(ips)


if __name__ == "__main__":
    local_network = "192.168.10.0/24"  # Modify based on your network range
    scan_network(local_network)
