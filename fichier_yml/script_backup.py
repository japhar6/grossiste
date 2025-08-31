import subprocess
import paramiko
import os
import datetime
import zipfile

# Variables
mongodb_host = "mongodb.innov.svc.cluster.local"  # IP ou hostname de MongoDB dans le cluster
mongodb_port = "27017"
mongodb_user = "root"  # Le nom d'utilisateur de MongoDB
mongodb_pass = "adminpass123"  # Le mot de passe
backup_dir = "/mnt/data/mongodb_backups/"  # Dossier de sauvegarde sur le VPS
local_backup_dir = "//data/mongo_backup/"  # Dossier de sauvegarde local sur votre machine

# Crée un nom de fichier pour la sauvegarde basé sur la date
backup_filename = f"mongodb_backup_{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.gz"
backup_file_path = os.path.join(backup_dir, backup_filename)

# Effectuer la sauvegarde de MongoDB avec mongodump
mongodump_command = f"mongodump --host {mongodb_host} --port {mongodb_port} --username {mongodb_user} --password {mongodb_pass} --archive={backup_file_path} --gzip"

# Exécuter la commande pour effectuer le backup
try:
    subprocess.run(mongodump_command, shell=True, check=True)
    print(f"Backup MongoDB effectué avec succès. Fichier de sauvegarde : {backup_file_path}")
except subprocess.CalledProcessError as e:
    print(f"Erreur lors de la sauvegarde de MongoDB : {e}")
    exit(1)

# Créer une archive ZIP de la sauvegarde
zip_filename = f"{backup_filename.replace('.gz', '')}.zip"
zip_file_path = os.path.join(backup_dir, zip_filename)

try:
    with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(backup_file_path, os.path.basename(backup_file_path))
    print(f"Fichier de sauvegarde compressé avec succès : {zip_file_path}")
except Exception as e:
    print(f"Erreur lors de la compression du fichier : {e}")
    exit(1)

# Connexion SSH à votre machine locale
local_ssh_host = "adresse_ip_de_votre_machine_locale"
local_ssh_user = "who"
local_ssh_pass = "Rakoto15.15062001"  # Si vous avez une clé privée SSH, vous pouvez l'utiliser pour la connexion
local_ssh_port = 22

# Création d'un client SSH et connexion à votre machine locale
ssh_client = paramiko.SSHClient()
ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh_client.connect(local_ssh_host, port=local_ssh_port, username=local_ssh_user, password=local_ssh_pass)
    
    # Utiliser SFTP pour transférer le fichier ZIP vers la machine locale
    sftp_client = ssh_client.open_sftp()
    sftp_client.put(zip_file_path, os.path.join(local_backup_dir, zip_filename))
    sftp_client.close()
    print(f"Sauvegarde transférée sur votre machine locale à : {local_backup_dir}")
    
except Exception as e:
    print(f"Erreur lors du transfert de la sauvegarde vers votre machine locale : {e}")
finally:
    ssh_client.close()
