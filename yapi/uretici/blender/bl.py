# Canli Blender'a (BlenderMCP eklentisi, localhost:9876) bir Python dosyasi gonderir ve sonucu yazar.
#   python yapi/uretici/blender/bl.py dosya.py [ek kod]
# Blender ekranda acik ve BlenderMCP baglantisi baslamis olmali (CLAUDE.md).
import socket, json, sys

def gonder(kod, port=9876):
    s = socket.create_connection(('localhost', port), timeout=600)
    s.sendall(json.dumps({'type': 'execute_code', 'params': {'code': kod}}).encode())
    d = b''
    while True:
        c = s.recv(1 << 16)
        if not c: break
        d += c
        try: return json.loads(d)
        except json.JSONDecodeError: continue
    return json.loads(d)

if __name__ == '__main__':
    kod = open(sys.argv[1], encoding='utf-8').read() + ('\n' + sys.argv[2] if len(sys.argv) > 2 else '')
    r = gonder(kod)
    print(json.dumps(r, ensure_ascii=False)[:3000])
